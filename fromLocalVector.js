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


async function processFile(fileUrl, metadata) {
    const secondStorageContext = await storageContextFromDefaults({
        persistDir: "./storage",
    });
    const loadedIndex = await SummaryIndex.init({
        storageContext: secondStorageContext,
    });
    const loadedQueryEngine = loadedIndex.asQueryEngine();
    const loadedResponse = await loadedQueryEngine.query(
        "What is the text about?",
    );
    console.log(loadedResponse.toString());

};


processFile("https://canvas.instructure.com/files/4298~24090847/download?download_frd=1&verifier=thhEWnOkTmpAZB9457dLaIuiU2WhX2bozZ4eOzGC",{
    filename:"lec9-link-recap.pdf"
});