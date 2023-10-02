if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const { MongoClient } = require('mongodb');
const { Document, VectorStoreIndex, SummaryIndex, serviceContextFromDefaults, OpenAI } = require("llamaindex");
const axios = require('axios');
const pdf = require('pdf-parse');
const fs = require('fs');

const currentTerm = "Fall23" // This is the term that we're currently in, and the only one we want to pull files from, format: Fall23, Fall24, Spr23, Spr24

// MongoDB
const mongoClient = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const summaryPrompt = "Summarize the contents of this document in 3 sentences. Classify it as lecture, practice test, project, syllabus, etc. Be consise and without filler words."

// Get summary and text from url of a PDF
async function processFile(fileUrl, metadata) {
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
    let data = await pdf(axiosResponse.data);
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

// Download PDF
async function downloadPdf(url, outputPath) {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(outputPath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading the file:', error);
    }
}

// Make directory if it doesn't exist
async function ensureDirExists(dirPath) {
    try {
        await fs.promises.mkdir(dirPath, { recursive: true });
        console.log('Directory ensured:', dirPath);
    } catch (error) {
        if (error.code === 'EEXIST') {
            // Directory already exists, no action needed
        } else {
            console.error('Error creating directory:', error);
        }
    }
}

// Populate DB with classes and files from Canvas API
// ------------------------------------------------------------------------------------------------------------------------------
async function populateUserFiles(canvas_key){
    // Connect to MongoDB
    await mongoClient.connect()
    const db = mongoClient.db('test');
    const users = db.collection('users');

    // Step 1: Pull classes from Canvas API
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${canvas_key}`);
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
        { canvasToken: canvas_key },
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
                console.log("Pulling content for " + classJson[i].course_code)

                // Enrich our metadata with summary and raw text
                for(let i=0; i<filesRes.length; i++){
                    try {
                        if (filesRes[i]['content-type']=="application/pdf"){ // Only process PDFs
                            filesRes[i].course_code = classJson[i].course_code;
                            filesRes[i].course_name = classJson[i].name;

                            // This part most likely to fail
                            let [summary, rawText] = await processFile(filesRes[i].url, {fileName: filesRes[i].display_name, created_at: filesRes[i].created_at});
                            if (summary.length > 0 && rawText.length > 0) {
                                console.log(filesRes[i].filename + " summary and raw text ✅")
                                filesRes[i].summary = summary;
                                filesRes[i].rawText = rawText;
                            }else{
                                console.log(filesRes[i].filename + " summary and raw text ❌")
                            }
                        }
                    } catch (error) {
                        console.log("❌Error❌ with processing file " + filesRes[i].filename)
                    }
                }

                // Push file metadata to DB
                let mongoPushRes = await users.updateOne(
                    { canvasToken: canvas_key }, 
                    { $set: { ['files.' + classJson[i].id]: filesRes } }
                );
                console.log(`Result from fileData push for ${classJson[i].course_code}:`)
                console.log(mongoPushRes);
            }
        } catch (error) {
            // Some classes don't have files, so we catch the error and continue
            console.log("Error with pulling files for class" + classJson[i].id + `[${classJson[i].course_code}]`)
        }
    }   
};

populateUserFiles(process.env.CANVAS_KEY)