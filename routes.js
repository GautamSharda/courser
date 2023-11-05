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
const { isLoggedIn, asyncMiddleware } = require("./middleware");
const DataProvider = require("./core_backend/dataProvider");
const Headers = require("node-fetch").Headers;
const fetch = require("node-fetch");
const axios = require('axios');
const pdf = require('pdf-parse');
const { MongoClient } = require('mongodb');
const fsNormal = require('fs');
const { ObjectId } = require("mongodb");
const { Pinecone } = require("@pinecone-database/pinecone");
const moment = require('moment-timezone');
const mongoose = require("mongoose");

// Important constants
const currentTerm = "Fall23"; // This is the term that we're currently in
currentTermCheck = async(course_code) => {
    if(course_code.includes("F") && course_code.includes("23")){
        return true;
    }
    return false;
}

Routes.get('/getCourserData', asyncMiddleware(async (req, res) => {
    const User = mongoose.model("User");

    // return the count of all users
    const userCount = await User.countDocuments({});
    res.json({userCount: userCount});
}));


Routes.post('/addCanvasToken', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { canvasToken } = req.body;
    const foundUser = await User.findById(res.userProfile._id);

    // Validate user token
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${canvasToken}`);
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    // this is just to confirm the token works
    const classDataResponse = await fetch("https://canvas.instructure.com/api/v1/courses?per_page=1", requestOptions);

    if (classDataResponse.status==401){
        return res.status(401).send('Invalid Canvas token');
    }

    // User token is valid, proceed
    foundUser.canvasToken = canvasToken;
    await foundUser.save();
    await postCanvasData(res.userProfile._id.toString(), canvasToken);
    res.json({ user: foundUser });
}));

Routes.get("/home", isLoggedIn, asyncMiddleware(async (req, res) => {
    const fileIds = res.userProfile.personalFiles;
    const files = [];
    for (const fileId of fileIds) {
        files.push({ name: fileId.name, id: fileId })
    }
    res.userProfile.personalFiles = files;
    // if (files.length === 0 && res.userProfile.canvasToken){
    //     postCanvasData(res.userProfile._id.toString(), res.userProfile.canvasToken);
    // }
    res.json({ user: res.userProfile });
}));


Routes.get("/isloggedin", isLoggedIn, asyncMiddleware(async (req, res) => {
    console.log('4');
    res.json({ user: res.userProfile });
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

    // Create Document object 
    startTime = Date.now();
    let data = await pdf(axiosResponse.data); // I hate this shit it prints warnings every time
    endTime = Date.now();
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

    // Query the index
    startTime = Date.now();
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        summaryPrompt,
    );
    endTime = Date.now();

    return [response.toString(), data.text];
};

/** Helper function
 * 
 * @param {*} filesBatch this is an array of files
 * @param {*} course this is the course object
 * @returns a promise that resolves to an array of files enriched with summary and raw text
 */
async function processFilesBatch(filesBatch, course) {
    // Filter out non-PDF files
    const pdfFiles = filesBatch.filter(file => file['content-type'] === "application/pdf");

    // Use Promise.all to process all the PDF files in parallel
    const processedFilesPromises = pdfFiles.map(async file => {
        file.course_code = course.course_code;
        file.course_name = course.name;
        file.type = "course";

        try {
            const [summary, rawText] = await processFile(file.url, { fileName: file.display_name, created_at: file.created_at });
            if (summary.length > 0 && rawText.length > 0) {
                // console.log(file.filename + " summary and raw text ✅");
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
async function pullAnnouncements(userID, canvasToken, classJson, myHeaders, requestOptions, index) {
    let allAnnouncementsFile =
    {
        owner: userID,
        preview_url: [],
        display_name: "AllRecentAnnouncements",
        summary: `This file contains all the announcements made across all courses in the past 7 days. 
    It could be used to answer queries like what are my most recent announcements? Any new announcements made in X class? 
    What are all the announcements made this week? Give me a summary of my recent announcements.`,
        rawText: "",
        type: "AllRecentAnnouncements"
    };
    let records = [];
    let recentAnnouncementFiles = [];
    for (i in classJson) {
        if (classJson[i].course_code && classJson[i].course_code.includes(currentTerm)) {
            console.log("Pulling announcements for " + classJson[i].course_code)
            const res = await fetch(`https://canvas.instructure.com/api/v1/courses/${classJson[i].id}/discussion_topics?only_announcements=true‍`, requestOptions);
            const jsonStr = await res.text();
            const modifiedStr = jsonStr.replace(/"id":(\d+)/g, '"id":"$1"');
            let announcements = JSON.parse(modifiedStr);
            for (announcement of announcements) {
                let preview_url = `https://uiowa.instructure.com/courses/${classJson[i].id.slice(-6)}/discussion_topics/${announcement.id}`
                const file = {
                    owner: userID,
                    id: announcement.id,
                    created_at: announcement.posted_at,
                    course_id: String(classJson[i].id),
                    display_name: announcement.title,
                    rawText: announcement.message ? announcement.message : 'null',
                    summary: `{This file is an announcement for ${classJson[i].name} class titled ${announcement.title}}. It was made on ${announcement.posted_at}`,
                    type: "announcement",
                    preview_url: preview_url,
                }

                try {
                    const createdAtDate = new Date(file.created_at);

                    // Get the current date
                    const currentDate = new Date();

                    // Subtract 7 days from the current date to get the start of the 7-day window
                    const sevenDaysAgo = new Date(currentDate);
                    sevenDaysAgo.setDate(currentDate.getDate() - 7);

                    // Check if the createdAtDate is within the last 7 days
                    if (createdAtDate >= sevenDaysAgo && createdAtDate <= currentDate) {
                        recentAnnouncementFiles.push(file);
                        allAnnouncementsFile.preview_url.push([file.preview_url, file.display_name]);
                    }
                } catch (e) { console.log('error putting this in allAnnouncementsSummary', e); }

                const uploadedFile = await File.create(file);
                const fileID = uploadedFile._id.toString();
                await User.findByIdAndUpdate(userID, { $push: { files: fileID } });

                const currEmbedding = await fetchEmbedding(JSON.stringify(file));
                records.push({ id: fileID, values: currEmbedding.data[0].embedding });
            }
            console.log(`Found ${announcements.length}`);
        }
    }

    allAnnouncementsFile.rawText = JSON.stringify(recentAnnouncementFiles);
    const uploadedAllAnnouncementsFile = await File.create(allAnnouncementsFile);
    const allAnnouncementsFileID = uploadedAllAnnouncementsFile._id.toString();
    await User.findByIdAndUpdate(userID, { $push: { files: allAnnouncementsFileID } });

    const currEmbedding = await fetchEmbedding(JSON.stringify(allAnnouncementsFile));
    records.push({ id: allAnnouncementsFileID, values: currEmbedding.data[0].embedding });

    console.log(`Writing ${records.length} records to vector store..`)
    try{
        await index.upsert(records);
    }catch(e){console.log(e)};
}

async function pullAssignments(userID, canvasToken, classJson, myHeaders, requestOptions, index) {
    // Pull user's assignments
    let records = [];
    let assignmentsArray = [];
    for(i in classJson){
        if (classJson[i].course_code && currentTermCheck(classJson[i].course_code)){
            console.log("Pulling assignments for " + classJson[i].course_code)
            const res = await fetch(`https://canvas.instructure.com/api/v1/courses/${classJson[i].id}/assignments`, requestOptions);
            const jsonStr = await res.text();
            const modifiedStr = jsonStr.replace(/"id":(\d+)/g, '"id":"$1"');
            let assignments = JSON.parse(modifiedStr);

            for (assignment of assignments) {
                let preview_url = `https://uiowa.instructure.com/courses/${classJson[i].id.slice(-6)}/assignments/${assignment.id}`
                const file = {
                    owner: userID,
                    id: assignment.id,
                    points_possible: assignment.points_possible,
                    created_at: assignment.created_at,
                    course_id: String(assignment.course_id),
                    display_name: assignment.name,
                    due_at: assignment.due_at,
                    course_code: classJson[i].course_code,
                    has_submitted_submissions: assignment.has_submitted_submissions,
                    rawText: assignment.description ? assignment.description : 'null',
                    summary: `{Assignment Name=${assignment.name}} for {Course Name = ${classJson[i].name}}. It is due on ${assignment.due_at} and is worth {${assignment.points_possible}} points.`,
                    type: "assignment",
                    preview_url: preview_url,
                }
                assignmentsArray.push(file);
                const uploadedFile = await File.create(file);
                const fileID = uploadedFile._id.toString();
                await User.findByIdAndUpdate(userID, { $push: { files: fileID } });

                const currEmbedding = await fetchEmbedding(JSON.stringify(file));
                records.push({ id: fileID, values: currEmbedding.data[0].embedding });
            }
            console.log(`Found ${assignments.length}`);
        }
    }

    //Filter down the assignments to the ones that are due in 14 days
    const today = new Date();
    const fourteenDays = new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000));
    //make sure its between today and 14 days from now
    const filteredFilesArray = assignmentsArray.filter(file => file.due_at && new Date(file.due_at) < fourteenDays && new Date(file.due_at) > today);
    //Now exclude everything except assignment1Name, and dueDate
    const filteredFilesArray2 = filteredFilesArray.map(file => {
        return {
            preview_url: file.preview_url,
            assignmentName: file.display_name,
            course_code: file.course_code,
            dueDate: file.due_at
        }
    });
    const dueDateFileRawText = filteredFilesArray2.map(assignment => {
        // Change UTC time to CST time
        const centralTime = moment(assignment.dueDate).tz("America/Chicago").format('YYYY-MM-DDTHH:mm:ss');
        return `${assignment.course_code} - ${assignment.assignmentName} - due on ${centralTime}`
    }).join('\n');
    
    let urls = []
    for (let i = 0; i < filteredFilesArray2.length; i++){
        urls.push([filteredFilesArray2[i].preview_url, filteredFilesArray2[i].assignmentName]);
    }

    // Create due date file
    const dueDateFile = {
        owner: userID,
        preview_url: urls,
        summary: `This file contains all assignments due in the next two weeks (14 days) and their due dates. It should be used to answer queries like what are all the assignments I have due this week? When is X assignment due? Make me a to do list of all my assignments next week`,
        rawText: dueDateFileRawText,
        type: "Upcoming assignments",
        display_name: "Upcoming assignments",
    }
    const uploadedFile = await File.create(dueDateFile);
    const fileID = uploadedFile._id.toString();
    await User.findByIdAndUpdate(userID, { $push: { files: fileID } });

    const currEmbedding = await fetchEmbedding(JSON.stringify(dueDateFile));
    records.push({ id: fileID, values: currEmbedding.data[0].embedding });

    console.log(`Writing ${records.length} records to vector store..`);
    try{
    await index.upsert(records);
    }catch(e){console.log(e)};
}

/** 
 * This function pulls all the files + assignments from Canvas and stores them in the DB
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

    console.log("Creating pinecone index..")
    const pinecone = new Pinecone();
    await pinecone.createIndex({
        name: userID,
        dimension: 1536,
        waitUntilReady: true
    });
    const index = pinecone.index(userID);

    let records = [];

    // Pull users assignments
    await pullAssignments(userID, canvasToken, classJson, myHeaders, requestOptions, index);
    // Pull users assignments
    await pullAnnouncements(userID, canvasToken, classJson, myHeaders, requestOptions, index);

    const classProcessingPromises = classJson.map(async classItem => {
        try {
            if (classItem.course_code && classItem.course_code.includes(currentTerm)) {
                let filesUrl = `https://canvas.instructure.com/api/v1/courses/${classItem.id}/files?per_page=1000`;
                let fileDataResponse = await fetch(filesUrl, requestOptions);
                let jsonStr = await fileDataResponse.text();
                let modifiedStr = jsonStr.replace(/"id":(\d+)/g, '"id":"$1"');
                let filesRes = JSON.parse(modifiedStr);

                if (fileDataResponse.status != 200) {
                    return;
                }

                console.log("Pulling file content for " + classItem.course_code);

                // Process and enrich the files
                const processedFiles = await processFilesBatch(filesRes, classItem);
                console.log(`Processed ${processedFiles.length} files in ${classItem.course_code}`)

                // Push file metadata to DB
                for (let j = 0; j < processedFiles.length; j++) {
                    let currFile = processedFiles[j];
                    if (currFile.created_at.startsWith("2023")) {
                        currFile.owner = userID;
                        currFile.preview_url = `https://uiowa.instructure.com/courses/${classItem.id.slice(-6)}/files?preview=${currFile.id}`
                        delete currFile.id;
                        const uploadedFile = await File.create(currFile);
                        const fileid = uploadedFile._id.toString();
                        await User.findByIdAndUpdate(userID, { $push: { files: fileid } });

                        const currEmbedding = await fetchEmbedding(JSON.stringify(currFile));
                        records.push({ id: fileid, values: currEmbedding.data[0].embedding });
                    }
                }
            }
        } catch (e) { console.log("error processing class", e); }
    });

    // Wait for all classes to be processed
    await Promise.all(classProcessingPromises);

    await index.upsert(records);

    let endTime = Date.now();
    console.log("Total setup time: " + (endTime - startTime) + " milliseconds");
    return;
}


async function fetchEmbedding(input) {
    const url = 'https://api.openai.com/v1/embeddings';
    const data = {
        input: input,
        model: "text-embedding-ada-002"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error:', error);
    }
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
            mongoFiles.push({ name: uploadedFile.display_name, id: uploadedFile._id.toString() });
            fileIds.push({name: uploadedFile.display_name, id: uploadedFile._id.toString()});
            //const writePdf = await dp.createPdfFromMongoId(uploadedFile._id.toString(), 'data');
        }
        const foundUser = await User.findById(res.userProfile._id);
        foundUser.personalFiles = foundUser.personalFiles.concat(fileIds);
        await foundUser.save();
        res.json({ files: mongoFiles });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Server error');
    }
}));


Routes.post('/answerTest', async (req, res) => {
    console.log("we are hitting TEST ") // Legacy code, do not remove or everything breaks.
    let startTime2 = Date.now();
    const prompt = req.body.body;
    console.log("Prompt: " + prompt)

    req.userProfile = JSON.parse(req.body.userProfile);
    console.log(req.userProfile)


    let startTime3 = Date.now();
    // find K most relevant files from  user.personalData, user.canvasData, UIOWAData, combine corresponding vectors, query
    const kMostRelevant = await getTopKRelevant(prompt, req.userProfile, process.env.KFILES); // Json array of file metadata
    let endTime3 = Date.now();
    console.log("Top K files time: " + (endTime3 - startTime3) + " milliseconds");

    // Get the documents
    let startTime4 = Date.now();
    let documents = [];
    let allSources = [];
    let numberOfURLs = 0;
    for (let i = 0; i < kMostRelevant.length; i++) {
        try {
            const id = new ObjectId(kMostRelevant[i]);
            const file = await File.findById(id);
            const rawText = file.rawText;
            const title = file.display_name;
            console.log(`Source ${numberOfURLs + 1}: ${title}`);
            const summary = file.summary;
            const type = file.type;
            let URL = file.preview_url;
            if (type === "personal"){
                let buffer = URL;
                const base64Data = buffer.toString('base64');
                URL = `data:application/pdf;base64,${base64Data}`;
            }
            if(Array.isArray(URL)){
                // console.log("PREVIEWS", URL);
                for (let u of URL){
                    let s = {}
                    numberOfURLs++;
                    s.number = numberOfURLs;
                    s.title = u[1];
                    s.url = u[0];
                    s.type = type;
                    allSources.push(s);
                }
            } else{
                let s = {}
                numberOfURLs++;
                s.number = numberOfURLs;
                s.title = title;
                s.url = URL;
                s.type = type;
                allSources.push(s);
            }
            let combinedText = title + summary + rawText;
            // console.log(combinedText);
            // console.log(combinedText);
            documents.push(new Document({ text: combinedText }));    
        } catch (e) { console.log(e); }
    }
    let endTime4 = Date.now();
    console.log("Fetching documents time: " + (endTime4 - startTime4) + " milliseconds");

    fsNormal.writeFileSync("./dumps/allSources.json", JSON.stringify(allSources))

    // Specify LLM model
    const serviceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
    });

    // Indexing
    const index = await SummaryIndex.fromDocuments(documents, { serviceContext });

    let startTime = Date.now();
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        prompt
    );
    let endTime = Date.now();
    console.log("Query time: " + (endTime - startTime) + " milliseconds");

    const answer = response.toString();

    const foundUser = await User.findById(req.userProfile._id.toString());
    foundUser.questions.push(prompt);
    foundUser.responses.push(answer);
    await foundUser.save();

    res.json({ finalAnswer: answer, sources: allSources });
    let endTime2 = Date.now();
    console.log("Total answer time: " + (endTime2 - startTime2) + " milliseconds");
    console.log('-------------------');
    console.log(`Answer: ${answer}`);
    console.log(`Sources: \n${allSources.join('\n')}`);
    console.log('-------------------');
});


Routes.post('/answer', isLoggedIn, asyncMiddleware(async (req, res) => {
    let startTime2 = Date.now();
    const { prompt } = req.body;
    console.log("we are hitting ") // Legacy code, do not remove or everything breaks.
    console.log("Prompt: " + prompt)

    // Put res.userProfile in dumps for automated queries (needed for benchmarking)
    // fsNormal.writeFileSync("./dumps/userProfile.json", JSON.stringify(res.userProfile))


    let startTime3 = Date.now();
    // find K most relevant files from  user.personalData, user.canvasData, UIOWAData, combine corresponding vectors, query
    const kMostRelevant = await getTopKRelevant(prompt, res.userProfile, process.env.KFILES); // Json array of file metadata
    let endTime3 = Date.now();
    console.log("Top K files time: " + (endTime3 - startTime3) + " milliseconds");

    // Get the documents
    let startTime4 = Date.now();
    let documents = [];
    let allSources = [];
    let numberOfURLs = 0;
    for (let i = 0; i < kMostRelevant.length; i++) {
        try {
            const id = new ObjectId(kMostRelevant[i]);
            const file = await File.findById(id);
            const rawText = file.rawText;
            const title = file.display_name;
            console.log(`Source ${numberOfURLs + 1}: ${title}`);
            const summary = file.summary;
            const type = file.type;
            let URL = file.preview_url;
            if (type === "personal"){
                let buffer = URL;
                const base64Data = buffer.toString('base64');
                URL = `data:application/pdf;base64,${base64Data}`;
            }
            if(Array.isArray(URL)){
                // console.log("PREVIEWS", URL);
                for (let u of URL){
                    let s = {}
                    numberOfURLs++;
                    s.number = numberOfURLs;
                    s.title = u[1];
                    s.url = u[0];
                    s.type = type;
                    allSources.push(s);
                }
            } else{
                let s = {}
                numberOfURLs++;
                s.number = numberOfURLs;
                s.title = title;
                s.url = URL;
                s.type = type;
                allSources.push(s);
            }
            let combinedText = title + summary + rawText;
            // console.log(combinedText);
            // console.log(combinedText);
            documents.push(new Document({ text: combinedText }));    
        } catch (e) { console.log(e); }
    }
    let endTime4 = Date.now();
    console.log("Fetching documents time: " + (endTime4 - startTime4) + " milliseconds");

    fsNormal.writeFileSync("./dumps/allSources.json", JSON.stringify(allSources))

    // Specify LLM model
    const serviceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
    });

    // Indexing
    const index = await SummaryIndex.fromDocuments(documents, { serviceContext });

    let startTime = Date.now();
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        prompt
    );
    let endTime = Date.now();
    console.log("Query time: " + (endTime - startTime) + " milliseconds");

    const answer = response.toString();

    const foundUser = await User.findById(res.userProfile._id.toString());
    foundUser.questions.push(prompt);
    foundUser.responses.push(answer);
    await foundUser.save();

    res.json({ finalAnswer: answer, sources: allSources });
    let endTime2 = Date.now();
    console.log("Total answer time: " + (endTime2 - startTime2) + " milliseconds");
    console.log('-------------------');
    console.log(`Answer: ${answer}`);
    console.log(`Sources: \n${allSources.join('\n')}`);
    console.log('-------------------');
}));

getTopKRelevant = async (query, user, k) => {
    const dataProvider = new DataProvider(user._id.toString());
    const canvasFiles = await dataProvider.getCanvasFileMetadata(false);

    // console.log('canvasFiles', canvasFiles);
    const personalFiles = await dataProvider.getPersonalFiles();
    // const collegeFiles = await dataProvider.getCollegeFiles();
    const allFiles = canvasFiles.concat(personalFiles);
    // const allFiles = canvasFiles.concat(personalFiles).concat({type:"collegefile", fileContent:collegeFiles});
    console.log(`User has ${allFiles.length} total files`);
    const proompter = new Proompter();
    const topKIds = await proompter.pickTopKFiles(allFiles, query, k, user._id.toString());
    return topKIds;
}


Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = Routes;