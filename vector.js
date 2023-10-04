if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const { MongoClient } = require('mongodb');
const { Document, VectorStoreIndex, SummaryIndex, serviceContextFromDefaults, OpenAI } = require("llamaindex");
const axios = require('axios');
const pdf = require('pdf-parse');
const fs = require('fs');

// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY
// });
// const openai = new OpenAIApi(configuration);

const mongoClient = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const summaryPrompt = "Summarize the contents of this document in 3 sentences. Classify it as lecture, practice test, project, syllabus, etc. Be consise and without filler words."

async function processFile(fileUrl, metadata) {
    // Download the PDF
    let startTime = Date.now();
    let axiosResponse = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'arraybuffer',  // Important
    });
    let endTime = Date.now();
    console.log("Requesting file took " + (endTime - startTime) + " milliseconds");

    // Create Document object 
    startTime = Date.now();
    let data = await pdf(axiosResponse.data);
    endTime = Date.now();
    console.log("Parsing PDF took " + (endTime - startTime) + " milliseconds");
    let document = new Document({ text: data.text, metadata: metadata });

    // Specify LLM model
    const serviceContext = serviceContextFromDefaults({
        llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
    });
    
    // Indexing 
    startTime = Date.now();
    const index = await SummaryIndex.fromDocuments([document], {serviceContext}); // LlamaIndex embedding
    // let index = await fetchEmbedding(document.text); // Openai embedding
    endTime = Date.now();
    console.log("Indexing took " + (endTime - startTime) + " milliseconds");

    // Query the index
    startTime = Date.now();
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        summaryPrompt,
    );
    endTime = Date.now();
    console.log("Query took " + (endTime - startTime) + " milliseconds");

    return [response.toString(), data.text];
};


processFile("https://canvas.instructure.com/files/4298~24090847/download?download_frd=1&verifier=thhEWnOkTmpAZB9457dLaIuiU2WhX2bozZ4eOzGC",{
    filename:"lec9-link-recap.pdf"
});