if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const { MongoClient } = require('mongodb');
const { Document, VectorStoreIndex, SimpleDirectoryReader, PDFReader } = require("llamaindex");
const fs = require('fs');
const axios = require('axios');
const pdf = require('pdf-parse');

const currentTerm = "Fall23" // This is the term that we're currently in, and the only one we want to pull files from, format: Fall23, Fall24, Spr23, Spr24

// MongoDB
// ------------------------------------------------------------------------------------------------------------------------------
const mongoClient = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Get summary and vector embeddings from url
async function processFile(fileUrl, metadata) {
    // Download the PDF
    let axiosResponse = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'arraybuffer',  // Important
    });

    // Create Document object with essay
    let data = await pdf(axiosResponse.data);
    let document = new Document({ text: data.text, metadata: metadata });
    // Split text and create embeddings. Store them in a VectorStoreIndex
    let startTime = Date.now();
    const index = await VectorStoreIndex.fromDocuments([document]);

    let endTime = Date.now();
    console.log("Indexing took " + (endTime - startTime) + " milliseconds");

    // Query the index
    startTime = Date.now();
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        "Summarize the contents of this document in 3 sentences. Classify it as lecture, practice test, project, syllabus, etc. Be consise and without filler words.",
    );
    endTime = Date.now();
    console.log("Query took " + (endTime - startTime) + " milliseconds");

    // Output response
    console.log(response.toString());
    return [response.toString(), index];
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

async function generateSummary(){
    return "Summary"
}


// Populate DB with classes and files from Canvas API
// ------------------------------------------------------------------------------------------------------------------------------
(async () => {
    // Connect to MongoDB
    await mongoClient.connect()
    // Step 1: Pull classes from Canvas API
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${process.env.CANVAS_KEY}`);
    // myHeaders.append("Cookie", "_csrf_token=9mdmJEsRDaLhNcQUKe7WrwYgrIOEfMqHrh78kuxF7U6DU0lKfyRlw4BZjkNDvJnISGrYwekTnLDUbauj2CG%2BPg%3D%3D; _legacy_normandy_session=4DsBJp7NxmZnueOxcc1WmQ.tTg_K_Awd_jZBOzn7vVibtbs9IUdtTl3IQEOJo_J_C_VYDP2sMidDT3MwkSivWufaC3QcRj9dF_0xp3eOtKHhqoWrez0a9RTRYShjw1IcjbMiuGgsxhGdTuPz4xfesAz.zZrz8DUlLble7HRn8thDxV78MI0.ZRhnyw; canvas_session=4DsBJp7NxmZnueOxcc1WmQ.tTg_K_Awd_jZBOzn7vVibtbs9IUdtTl3IQEOJo_J_C_VYDP2sMidDT3MwkSivWufaC3QcRj9dF_0xp3eOtKHhqoWrez0a9RTRYShjw1IcjbMiuGgsxhGdTuPz4xfesAz.zZrz8DUlLble7HRn8thDxV78MI0.ZRhnyw; log_session_id=614a0e42b06d78d202b60f9cf5cb1d8d");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    const classDataResponse = await fetch("https://canvas.instructure.com/api/v1/courses?per_page=1000", requestOptions);
    let jsonStr = await classDataResponse.text();
    const modifiedStr = jsonStr.replace(/"id":(\d+)/g, '"id":"$1"');

    let classJson = JSON.parse(modifiedStr); 

    fs.writeFileSync('./classJson.json', JSON.stringify(classJson));
    // Print status code
    if (classDataResponse.status != 200){
        console.log(`❌ Canvas API call unsuccessful: ${classDataResponse.status}-${classDataResponse.statusText}`);
        return;
    }
    else{
        console.log(`✅ Canvas API call successful: 200-OK`);
    }
    
    // Push classJson to user's DB because we're data collection sluts
    const db = mongoClient.db('test');
    const users = db.collection('users');

    let mongoPushRes = await users.updateOne(
        { canvasToken: process.env.CANVAS_KEY }, // HARD CODED USER CANVAS KEY
        { $set: { classData: classJson } }
    );
    console.log(`Result from classData push:`)
    console.log(mongoPushRes);

    // Iteratively request files for all classes
    for(let i=0; i<classJson.length; i++){
        try {
            if(classJson[i].course_code.includes(currentTerm)){ // Important to catch only current classes, not past ones
                let filesUrl = `https://canvas.instructure.com/api/v1/courses/${classJson[i].id}/files`
                let fileDataResponse = await fetch(filesUrl, requestOptions);
                let filesRes = JSON.parse(await fileDataResponse.text());
            
                // Print status code
                if (fileDataResponse.status != 200){
                    continue;
                } else{
                    console.log(`✅ Canvas API call successful: 200-OK`);
                }

                console.log("Pulling content for " + classJson[i].course_code)

                // Pulls all files for the class and stores them
                const classDir = `./userFiles/class_${classJson[i].id}`
                await ensureDirExists(classDir)
                for(let i=0; i<filesRes.length; i++){
                    console.log("Processing file: " + filesRes[i].filename)
                    // let summary = await generateSummary(filesRes[i].url);
                    //embedding here
                    filesRes[i].summary = "summary";
                    filesRes[i].course_code = classJson[i].course_code;
                    filesRes[i].course_name = classJson[i].name;
                    let index, summary  = await processFile(filesRes[i].url, {fileName: filesRes[i].display_name, created_at: filesRes[i].created_at});
                    filesRes[i].summary = summary;
                    filesRes[i].index = index;
                }
                // Push file metadata to DB
                let mongoPushRes = await users.updateOne(
                    { canvasToken: process.env.CANVAS_KEY }, // HARD CODED USER CANVAS KEY
                    { $set: { ['files.' + classJson[i].id]: filesRes } }
                );
                console.log(mongoPushRes);
            }
        } catch (error) {
            // Some classes don't have files, so we catch the error and continue
            console.log(error);
        }
    }

    
})();


