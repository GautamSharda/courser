if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const Routes = express.Router();
const user = require("./models/user");
const fs = require("fs/promises");
const { Document, VectorStoreIndex, SummaryIndex, serviceContextFromDefaults, OpenAI, SimpleDirectoryReader } = require("llamaindex");
const Canvas = require("./classes/Canvas");
const { Configuration, OpenAIApi } = require("openai");
const Proompter = require("./proompter");
const DataProvider = require("./dataprovider");
const Headers = require("node-fetch").Headers;
const fetch = require("node-fetch");
const axios = require('axios');
const pdf = require('pdf-parse');
const { MongoClient } = require('mongodb');
const fsNormal = require('fs');

Routes.post("/home", async (req, res) => {
    const { canvasToken } = req.body;
    console.log(canvasToken)
    let existingUser = await user.findOne({ canvasToken });
    console.log(canvasToken)
    // if (existingUser) {
    //     if (existingUser.files.length===0){
    //         postCanvasData(existingUser, canvasToken);
    //     }
    //     res.json(existingUser);
    // } else {
    let newUser = await user.create({ canvasToken });
    postCanvasData(newUser, canvasToken);
    res.json(newUser);
    // }
});


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
        llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 }),
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
    return Promise.all(filesBatch.map(async file => {
        if (file['content-type'] == "application/pdf") { // Only process PDFs
            file.course_code = course.course_code;
            file.course_name = course.name;

            try {
                const [summary, rawText] = await processFile(file.url, { fileName: file.display_name, created_at: file.created_at });
                if (summary.length > 0 && rawText.length > 0) {
                    console.log(file.filename + " summary and raw text ✅")
                    file.summary = summary;
                    file.rawText = rawText;
                } else {
                    console.log(file.filename + " summary and raw text ❌")
                }
            } catch (error) {
                console.log("❌Error❌ with processing file " + file.filename);
            }
        }
        return file;
    }));
}

/** 
 * TODO: Pull all files from Canvas, construct the File object, put it in DB under the newUser 
 * Owner: Ilya 
 */
postCanvasData = async (existingUser, canvasToken) => {
    // fsNormal.writeFileSync("./canvastoken.txt", canvasToken)
    const mongoClient = new MongoClient(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const currentTerm = "Fall23" // This is the term that we're currently in, and the only one we want to pull files from, format: Fall23, Fall24, Spr23, Spr24

    let startTime = Date.now();
    // Connect to MongoDB
    await mongoClient.connect()
    const db = mongoClient.db('test');
    const users = db.collection('users');

    // Clear existing files, since were repulling them
    await users.updateOne(
        { canvasToken: canvasToken },
        { $set: { files: [] } }
    );

    // Step 1: Pull classes from Canvas API
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
    }
    else {
        console.log(`Canvas enrollment data call: 200 ✅`);
    }

    // Push classJson to user's DB because we're data collection sluts
    let mongoPushRes = await users.updateOne(
        { canvasToken: canvasToken },
        { $set: { classData: classJson } }
    );
    console.log(`Result from enrollment data push:`)
    console.log(mongoPushRes);

    // Iteratively request files for all classes
    for (let i = 0; i < classJson.length; i++) {
        try {
            if (classJson[i].course_code.includes(currentTerm)) { // Important to catch only current classes, not past ones
                // Make get request
                let filesUrl = `https://canvas.instructure.com/api/v1/courses/${classJson[i].id}/files`
                let fileDataResponse = await fetch(filesUrl, requestOptions);
                let filesRes = JSON.parse(await fileDataResponse.text());
                if (fileDataResponse.status != 200) {
                    continue;
                } else {
                    console.log(`✅ Canvas API call successful: 200-OK`);
                }
                console.log("Pulling content for " + classJson[i].course_code);

                // Add classId to each obj
                filesRes = filesRes.map(file => ({
                    ...file,
                    classID: classJson[i].id
                }));

                // Enrich our metadata with summary and raw text 
                // MULTI THREADING
                const BATCH_SIZE = 5;
                let enrichedFiles = [];
                for (let j = 0; j < filesRes.length; j += BATCH_SIZE) {
                    const filesBatch = filesRes.slice(j, j + BATCH_SIZE);
                    await processFilesBatch(filesBatch, classJson[i]);
                    enrichedFiles = enrichedFiles.concat(filesBatch);
                }

                // Push file metadata to DB
                let mongoPushRes = await users.updateOne(
                    { canvasToken: canvasToken },
                    { $push: { files: { $each: enrichedFiles } } }
                );
                console.log(`Result from fileData push for ${classJson[i].course_code}:`)
                console.log(mongoPushRes);
            }
        } catch (error) {
            // Some classes don't have files, so we catch the error and continue
            console.log("Error with pulling files for class" + classJson[i].id + `[${classJson[i].course_code}]`)
        }
    }
    let endTime = Date.now();
    console.log("Total time: " + (endTime - startTime) + " milliseconds");
    return;
}

Routes.post('/upload', async (req, res) => {
    try {
        const { canvasToken, files } = req.body;
        // files doesn't seem right
        for (const file of files) {
            // save file to uploads directory
            // console.log(file);
            const fileNameNoDot = file.name.split('.')[0];
            const filePath = path.join(__dirname, 'userFiles', fileNameNoDot + file.md5 + '.pdf');
            await file.mv(filePath);
        }

        // const agent = new Agent(filePath, '', []);
        // const plans = await agent.ready();
        let foundUser = await user.findOne({ canvasToken });
        res.json(foundUser);
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Server error');
    }
});


Routes.post('/answer', async (req, res) => {
    const { canvasToken, prompt } = req.body;

    console.log('we are hitting');
    // console.log(canvasToken);
    // console.log(prompt);

    // find K most relevant files from  user.personalData, user.canvasData, UIOWAData, combine corresponding vectors, query
    const kMostRelevant = await getTopKRelevant(prompt, canvasToken, 3); // Json array of file metadata
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
    console.log("kMostRelevantFiles", kMostRelevant);
    for (let i = 0; i < kMostRelevant.length; i++) {
        const file = kMostRelevant[i];
        const dp = new DataProvider(canvasToken);
        // console.log(file.id);
        let rawText = await dp.fetchRawTextOfFile(file.id); // ??
        console.log(rawText);
        documents.push(new Document({ text: rawText }))
    }

    // Specify LLM model
    const serviceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 }),
    });

    // console.log(documents);
    const index = await SummaryIndex.fromDocuments(documents, { serviceContext });

    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        prompt,
    );

    const answer = response.toString();
    console.log(`the final answer: ${answer}`);

    const foundUser = await user.findOne({ canvasToken });
    foundUser.questions.push(prompt);
    foundUser.responses.push(answer);
    await foundUser.save();

    res.json(foundUser);
});

getTopKRelevant = async (query, canvasToken, k) => {
    const dataProvider = new DataProvider(canvasToken);
    const canvasFiles = await dataProvider.getCanvasFileMetadata(false);

    // console.log('canvasFiles', canvasFiles);
    const personalFiles = await dataProvider.getPersonalFiles();
    // const collegeFiles = await dataProvider.getCollegeFiles();

    const allFiles = canvasFiles;
    // const allFiles = canvasFiles.concat(personalFiles).concat({type:"collegefile", fileContent:collegeFiles});

    const proompter = new Proompter();
    const topKIndices = await proompter.pickTopKFiles(allFiles, query, k);
    let topKFiles = [];
    topKIndices.forEach(index => topKFiles.push(allFiles[index]));
    return topKFiles;
}


Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = Routes;