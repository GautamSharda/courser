if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const Routes = express.Router();
const user = require("./models/user");
const fs = require("fs/promises");
const { Document, VectorStoreIndex, SummaryIndex, serviceContextFromDefaults, OpenAI } = require("llamaindex");
const Canvas = require("./classes/Canvas");
const { Configuration, OpenAIApi } = require("openai");
const Proompter = require("./proompter");
const dataProvider = require("./dataProvider");
const axios = require('axios');
const pdf = require('pdf-parse');
const { MongoClient } = require('mongodb');

Routes.post("/home", async (req, res) => {
    const { canvasToken } = req.body;
    let existingUser = await user.findOne({ canvasToken });
    if (existingUser) {
        res.json(existingUser);
    } else {
        let newUser = await user.create({ canvasToken });
        // postCanvasData(newUser, canvasToken);
        res.json(newUser);
    }
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
    const index = await SummaryIndex.fromDocuments([document], {serviceContext}); // LlamaIndex embedding
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
postCanvasData = async (canvasToken) => {
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

    if (classDataResponse.status != 200){
        console.log(`Canvas enrollment data call ❌ ${classDataResponse.status}-${classDataResponse.statusText}`);
        return;
    }
    else{
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
    for(let i=0; i<classJson.length; i++){
        try {
            if(classJson[i].course_code.includes(currentTerm)){ // Important to catch only current classes, not past ones
                // Make get request
                let filesUrl = `https://canvas.instructure.com/api/v1/courses/${classJson[i].id}/files`
                let fileDataResponse = await fetch(filesUrl, requestOptions);
                let filesRes = JSON.parse(await fileDataResponse.text());
                if (fileDataResponse.status != 200){
                    continue;
                } else{
                    console.log(`✅ Canvas API call successful: 200-OK`);
                }
                console.log("Pulling content for " + classJson[i].course_code);

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
                    { $set: { ['files.' + classJson[i].id]: enrichedFiles } }
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
            console.log(file);
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
    console.log(canvasToken);
    console.log(prompt);

    const foundUser = await user.findOne({ canvasToken });
    foundUser.questions.push(prompt);
    await foundUser.save();

    res.json(foundUser);

    // console.log('we are hitting');
    // console.log(canvasToken);
    // console.log(prompt);

    // // find K most relevant files from  user.personalData, user.canvasData, UIOWAData, combine corresponding vectors, query
    // const kMostRelevant = getTopKRelevant(prompt, canvasToken, k);

    // downloadPDFs(kMostRelevant);

    // const documents = await new SimpleDirectoryReader().loadData({directoryPath: "./data"});
    // console.log(documents);

    // const index = await VectorStoreIndex.fromDocuments(documents);

    // const queryEngine = index.asQueryEngine();
    // const response = await queryEngine.query(
    //     prompt,
    // );

    // console.log(response.toString());    

    // const foundUser = await user.findOne({ canvasToken });
    // foundUser.questions.push([prompt, response]);
    // await foundUser.save();

});

getTopKRelevant = async (query, canvasToken, k) => {
    const dataProvider = new DataProvider(canvasToken);
    const canvasFiles = await dataProvider.getCanvasFiles();
    const personalFiles = await dataProvider.getPersonalFiles();
    const UIFiles = await dataProvider.getUIFiles();

    const allFiles = canvasFiles.concat(personalFiles).concat(UIFiles);

    const proompter = new Proompter();
    const topKIndices = proompter.pickTopKFiles(allFiles, query, k);
    let topKFiles = [];
    topKIndices.forEach(index => topKFiles.push(allFiles[index]));

    return topKIndices;
}


Routes.post('/test', async (req, res) => {
    downloadPDFs(req.body.files);
});

downloadPDFs = async(files) => {
    console.log(files);
    files.forEach(file = async() => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    let response = await fetch(file.url, requestOptions);
    // download PDFs from url
    // override whatever is in ./data
    })

}

Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = Routes;