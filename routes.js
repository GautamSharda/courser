if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const Routes = express.Router();
const User = require("./models/user");
const fs = require("fs/promises");
const { Document, VectorStoreIndex, SummaryIndex, serviceContextFromDefaults, OpenAI, SimpleDirectoryReader } = require("llamaindex");
const Canvas = require("./classes/Canvas");
const { Configuration, OpenAIApi } = require("openai");
const Proompter = require("./core_backend/proompter");
const path = require('path');
const File = require("./models/files");
const { isLoggedIn, asyncMiddleware, randomStringToHash24Bits } = require("./middleware");
const jwt = require("jsonwebtoken");
const DataProvider = require("./core_backend/dataProvider");
const Headers = require("node-fetch").Headers;
const fetch = require("node-fetch");
const axios = require('axios');
const pdf = require('pdf-parse');
const { MongoClient } = require('mongodb');
const fsNormal = require('fs');
const { ObjectId } = require("mongodb");

// Important constants
const currentTerm = "Fall23"; // This is the term that we're currently in


Routes.post('/addCanvasToken', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { canvasToken } = req.body;
    const foundUser = await User.findById(res.userProfile._id);
    foundUser.canvasToken = canvasToken;
    await foundUser.save();
    postCanvasData(res.userProfile._id.toString(), canvasToken);
    res.json({ user: foundUser });
}));

Routes.get("/home", isLoggedIn, asyncMiddleware(async (req, res) => {
    const fileIds = res.userProfile.personalFiles;
    const files = [];
    for (const fileId of fileIds) {
        //get only the field fileName from the file object
        const fileName = await File.findById(fileId).select('fileName');
        files.push({name: fileName.fileName, id: fileId});
    }
    res.userProfile.personalFiles = files;
    // if (files.length === 0 && res.userProfile.canvasToken){
    //     postCanvasData(res.userProfile._id.toString(), res.userProfile.canvasToken);
    // }
    res.json({user: res.userProfile});
}));


Routes.get("/isloggedin", isLoggedIn, asyncMiddleware(async (req, res) => {
    console.log('4');
    res.json({user: res.userProfile});
}));

/** Helper function
 * 
 * @param {*} fileUrl this is the URL of the file on the web
 * @param {*} metadata this is the metadata of the file
 * @returns a promise that resolves to an array of [summary, rawText]
 */
async function processFile(fileUrl, metadata) {
    const summaryPrompt = "Summarize the contents of this document in 3 sentences. Classify it as lecture, practice test, project, syllabus, etc. Be consise and without filler words."
    // Download the PDF
    let startTime = Date.now();
    let axiosResponse = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'arraybuffer',  // Important
    });
    let endTime = Date.now();
    // console.log("Requesting file took " + (endTime - startTime) + " milliseconds");

    // Create Document object 
    startTime = Date.now();
    let data = await pdf(axiosResponse.data); // I hate this shit it prints warnings every time
    endTime = Date.now();
    // console.log("Parsing PDF took " + (endTime - startTime) + " milliseconds");
    let document = new Document({ text: data.text, metadata: metadata });

    // Specify LLM model
    const serviceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
    });

    // Indexing 
    startTime = Date.now();
    const index = await SummaryIndex.fromDocuments([document], { serviceContext }); // LlamaIndex embedding
    // let index = await fetchEmbedding(document.text); // Openai embedding
    endTime = Date.now();
    // console.log("Indexing took " + (endTime - startTime) + " milliseconds");

    // Query the index
    startTime = Date.now();
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        summaryPrompt,
    );
    endTime = Date.now();
    // console.log("Query took " + (endTime - startTime) + " milliseconds");

    return [response.toString(), data.text];
};

/** Helper function
 * 
 * @param {*} filesBatch this is an array of files
 * @param {*} course this is the course object
 * @returns a promise that resolves to an array of files enriched with summary and raw text
 */
 async function processFilesBatch(filesBatch, course) {
    //  console.log('FBH', filesBatch.length);
    // Filter out non-PDF files
    const pdfFiles = filesBatch.filter(file => file['content-type'] === "application/pdf");

    // console.log('PDF', pdfFiles.length);
    // Use Promise.all to process all the PDF files in parallel
    const processedFilesPromises = pdfFiles.map(async file => {
        file.course_code = course.course_code;
        file.course_name = course.name;

        try {
            const [summary, rawText] = await processFile(file.url, { fileName: file.display_name, created_at: file.created_at });
            if (summary.length > 0 && rawText.length > 0) {
                console.log(file.filename + " summary and raw text ✅");
                file.summary = summary;
                file.rawText = rawText;
            } else {
                console.log(file.filename + " summary and raw text ❌");
            }
        } catch (error) {
            console.log("❌Error❌ with processing file " + file.filename);
        }
        return file;
    });

    const processedFiles = await Promise.all(processedFilesPromises);
    return processedFiles;
}

async function pullAssignments(userID, canvasToken, classJson, myHeaders, requestOptions){
    // Pull users assignments
    // console.log(classJson)
    for(i in classJson){
        if (classJson[i].course_code && classJson[i].course_code.includes(currentTerm)){
            console.log("Pulling assignments for " + classJson[i].course_code)
            const res = await fetch(`https://canvas.instructure.com/api/v1/courses/${classJson[i].id}/assignments`, requestOptions);
            const jsonStr = await res.text();
            const modifiedStr = jsonStr.replace(/"id":(\d+)/g, '"id":"$1"');
            let assignments = JSON.parse(modifiedStr);

            filesArray = [];
            for (assignment of assignments){
                const file = {
                    owner: userID,
                    id: assignment.id,
                    points_possible: assignment.points_possible,
                    created_at: assignment.created_at,
                    course_id: assignment.course_id,
                    display_name: assignment.name,
                    due_at: assignment.due_at,
                    has_submitted_submissions: assignment.has_submitted_submissions,
                    rawText: assignment.description ? assignment.description : 'null',
                    summary: `{Assignment Name=${assignment.name}} for {Course Name = ${classJson[i].name}}. It is due on ${assignment.due_at} and is worth {${assignment.points_possible}} points.`,
                    type: "assignment"
                }
                const uploadedFile = await File.create(file);
                const fileID = uploadedFile._id.toString();
                await User.findByIdAndUpdate(userID, { $push: { files: fileID } });
            }
        }
    }
}

/** 
 * TODO: Pull all files from Canvas, construct the File object, put it in DB under the newUser 
 * Owner: Ilya 
 */
 async function postCanvasData(userID, canvasToken) {
    

    let startTime = Date.now();

    await User.findByIdAndUpdate(userID, { $set: { files: [] } }, { new: true });

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${canvasToken}`);
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    const classDataResponse = await fetch("https://canvas.instructure.com/api/v1/courses?per_page=1000", requestOptions);
    let jsonStr = await classDataResponse.text();
    const modifiedStr = jsonStr.replace(/"id":(\d+)/g, '"id":"$1"');
    let classJson = JSON.parse(modifiedStr);

    if (classDataResponse.status != 200) {
        console.log(`Canvas enrollment data call ❌ ${classDataResponse.status}-${classDataResponse.statusText}`);
        return;
    } else {
        console.log(`Canvas enrollment data call: 200 ✅`);
    }

    await User.findByIdAndUpdate(userID, { $set: { classJson: classJson } });
    
    // Pull users assignments
    await pullAssignments(userID, canvasToken, classJson, myHeaders, requestOptions);

    const classProcessingPromises = classJson.map(async classItem => {
        try{
        if (classItem.course_code && classItem.course_code.includes(currentTerm)) {
            let filesUrl = `https://canvas.instructure.com/api/v1/courses/${classItem.id}/files?per_page=1000`;
            let fileDataResponse = await fetch(filesUrl, requestOptions);
            let filesRes = JSON.parse(await fileDataResponse.text());
            
            if (fileDataResponse.status != 200) {
                return;
            }

            console.log("Pulling content for " + classItem.course_code);
            // console.log("filesRes", JSON.stringify(filesRes, null, 2));
            
            // Process and enrich the files
            const processedFiles = await processFilesBatch(filesRes, classItem);
            // console.log('enrichedFiles', processedFiles);

            // Push file metadata to DB
            for (let j = 0; j < processedFiles.length; j++) {
                let currFile = processedFiles[j];
                currFile.owner = userID;
                delete currFile.id;
                const uploadedFile = await File.create(currFile);
                const fileid = uploadedFile._id.toString();
                await User.findByIdAndUpdate(userID, { $push: { files: fileid } });
                // console.log('uploaded file', uploadedFile);
                // console.log('with this id', uploadedFile._id);
            }
        }
    }catch(e){console.log("error processing class", e);}
    });

    // Wait for all classes to be processed
    await Promise.all(classProcessingPromises);

    let endTime = Date.now();
    console.log("Total time: " + (endTime - startTime) + " milliseconds");
    return;
}

Routes.post('/upload', isLoggedIn, asyncMiddleware(async (req, res) => {
    try {
        var files = req.files.file;
        //check if files in an arrray, if not make it an array
        if (!Array.isArray(files)) {
            files = [files];
        }
        // files doesn't seem right
        const mongoFiles = [];
        const fileIds = [];
        for (const myfile of files) {
            const fileNameNoDot = myfile.name.split('.')[0];
            // const filePath = path.join(__dirname, 'userFiles', fileNameNoDot + myfile.md5 + '.pdf');
            // await myfile.mv(filePath);
            const dp = new DataProvider(res.userProfile._id.toString());
            const uploadedFile = await dp.uploadFileToMongo(myfile);
            mongoFiles.push({name: uploadedFile.fileName, id: uploadedFile._id.toString()});
            fileIds.push(uploadedFile._id.toString());
            //const writePdf = await dp.createPdfFromMongoId(uploadedFile._id.toString(), 'data');
        }
        const foundUser = await User.findById(res.userProfile._id);
        foundUser.personalFiles = foundUser.personalFiles.concat(fileIds);
        await foundUser.save();
        res.json({files: mongoFiles});
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Server error');
    }
}));


Routes.post('/accountCreation', async (req, res) => {
    const { idToken, email, name } = req.body;
    const uid = randomStringToHash24Bits(idToken);
    const foundUser = await User.findById(uid);
    if (!foundUser) {
        const newUser = new User({ _id: uid, email: email, name: name })
        await newUser.save();
    }
    const token = jwt.sign({ _id: uid, }, process.env.JWT_PRIVATE_KEY, { expiresIn: "1000d" });
    res.status(200).send({ token: token, message: 'Login successful' });
});


Routes.post('/answer', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { prompt } = req.body;
    console.log('we are hitting');
    // console.log(canvasToken);
    // console.log(prompt);

    // find K most relevant files from  user.personalData, user.canvasData, UIOWAData, combine corresponding vectors, query
    const kMostRelevant = await getTopKRelevant(prompt, res.userProfile, 1); // Json array of file metadata
    // for (file in kMostRelevant){
    //     const fileName = `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}.txt`;
    //     if (file.rawText){
    //         const fileText = file.rawText;
    //         if (!fs.existsSync(`./data/${canvasToken}`)){
    //             fs.mkdirSync(`./data/${canvasToken}`);
    //         }
    //         fs.writeFileSync(`./data/${canvasToken}/${fileName}`, fileText);
    //     }
    // }

    // let documents = []
    // for (file in kMostRelevant){
    //     let fileMetaData = file;
    //     delete fileMetaData.rawText;
    //     documents.append(new Document({text:file.rawText, metadata: fileMetaData}))
    // }
    // console.log(documents);

    let documents = [];
    let sources = [];
    console.log("kMostRelevantFiles", kMostRelevant);
    for (let i = 0; i < kMostRelevant.length; i++) {
        const id = kMostRelevant[i];
        const dp = new DataProvider(res.userProfile._id.toString());
        // console.log(file.id);
        let rawText = await dp.fetchRawTextOfFile(id); // ??
        // console.log(rawText + '\n');
        try{
            const source = await dp.fetchURL(id);
            sources.push(source);
        }catch(e){}
        documents.push(new Document({ text: rawText }))
    }

    // Specify LLM model
    const serviceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
    });

    // console.log(documents);
    const index = await SummaryIndex.fromDocuments(documents, { serviceContext });

    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        prompt,
    );

    const answer = response.toString();
    let finalAnswer = answer;
    for (let i = 0; i < sources.length; i++){
        // console.log( `Source ${i+1}=${sources}\n`);
        finalAnswer += ` Source ${i+1}=${sources}\n`;
    }
    console.log('FINAL ANSWER ', finalAnswer);
    const foundUser = await User.findById(res.userProfile._id.toString());
    foundUser.questions.push(prompt);
    foundUser.responses.push(answer);
    await foundUser.save();

    res.json(finalAnswer);
}));

getTopKRelevant = async (query, user, k) => {
    const dataProvider = new DataProvider(user._id.toString());
    const canvasFiles = await dataProvider.getCanvasFileMetadata(false);

    // console.log('canvasFiles', canvasFiles);
    const personalFiles = await dataProvider.getPersonalFiles();
    // const collegeFiles = await dataProvider.getCollegeFiles();
    // console.log('personalFiles', personalFiles);
    const allFiles = canvasFiles.concat(personalFiles);
    // const allFiles = canvasFiles.concat(personalFiles).concat({type:"collegefile", fileContent:collegeFiles});
    console.log(allFiles.length);
    const proompter = new Proompter();
    const topKIds = await proompter.pickTopKFiles(allFiles, query, k);
    console.log(topKIds);
    return topKIds;
}


Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = Routes;