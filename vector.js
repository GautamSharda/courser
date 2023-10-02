if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const { MongoClient } = require('mongodb');
const { Document, VectorStoreIndex, SummaryIndex, storageContextFromDefaults } = require("llamaindex");
const axios = require('axios');
const pdf = require('pdf-parse');

const mongoClient = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

/**
 * TODO:
 * Push the index to the database, be able to retrieve it and query an llm with it
 * 
 */


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
    // Split text and create embeddings. Store them in a SummaryIndex
    let startTime = Date.now();

    const index = await SummaryIndex.fromDocuments([document]);

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
    console.log(index);

    // const db = mongoClient.db('test');
    // const users = db.collection('users');
    // let mongoPushRes = await users.updateOne(
    //     { canvasToken: process.env.CANVAS_KEY }, // HARD CODED USER CANVAS KEY
    //     { $set: { 'embedding': index } }
    // );
};


processFile("https://canvas.instructure.com/files/4298~24090847/download?download_frd=1&verifier=thhEWnOkTmpAZB9457dLaIuiU2WhX2bozZ4eOzGC",{
    filename:"lec9-link-recap.pdf"
});