const Course = require('../models/course');
const CreateFiles = require('./CreateFiles');
const fs = require('fs');
const { Pinecone, Index, PineconeRecord, QueryResponse, ScoredPineconeRecord } = require('@pinecone-database/pinecone');
const { Document, SummaryIndex, ServiceContext, serviceContextFromDefaults, OpenAI, BaseQueryEngine } = require("llamaindex");

const INDEX = "courser";
const PINECONE = new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY
});

class CourserAIAssistant {
    constructor(courseID) {
        this.courseID = courseID;
    }

    async newCourseConfig() {
        await this.createFiles();
        return;
    }

    async askQuestion(message, thread) {
        const msgEmbedding = await this.getEmbedding(message);
        const index = PINECONE.index(INDEX);
        const namespace = index.namespace(this.courseID); 
        const pineconeRes = await namespace.query({topK: 5, vector: msgEmbedding});
        const matches = pineconeRes.matches;
        
        const course = await Course.findById(this.courseID);
        const chunks = await this.getChunks(course.filepath);
        const relevantChunks = [];
        const documents = [];
        for (const match of matches){
            const relevantChunk = chunks[Number(match.id)];
            relevantChunks.push(relevantChunk);
            const combinedText = relevantChunk.title + "\n" + relevantChunk.text + "\n" + relevantChunk.link;
            documents.push(new Document({ text: combinedText }));
        }

        // Specify LLM model
        const serviceContext = serviceContextFromDefaults({
            llm: new OpenAI({ model: "gpt-4-1106-preview", temperature: 0 }),
        });

        // Indexing
        const llamaIndex = await SummaryIndex.fromDocuments(documents, { serviceContext });
        // Make query

        const queryEngine = llamaIndex.asQueryEngine();
        const llamaResponse = await queryEngine.query(
            message
        );
    
        const answer = llamaResponse.toString();
        console.log(answer);

        //For later, switch out query engine with chat engine and your our own retriever, not theirs:
        // const retriever = llamaIndex.asRetriever();
        // const chatEngine = new ContextChatEngine({ retriever });

        // start chatting
        // const llamaResponse = await chatEngine.chat(message);

        const sources = []
        for (let i = 0; i < relevantChunks.length; i++) {
            const chunk = relevantChunks[i];
            const timestamp = chunk.link.split("&t=")[1].split("s")[0];
            const minutes = Math.floor(timestamp / 60);
            const seconds = timestamp % 60;
            sources.push({
                url: chunk.link,
                title: chunk.title,
                type: "YouTube",
                seconds: seconds,
                minutes: minutes,
                number: i
            })
        }

        const response = answer + "\n" + JSON.stringify(sources);
        console.log(`q: ${message}`, "\n", `a: ${response}`);

        return { answer: answer, sources: sources };
    }

    async createFiles() {
        const createFiles = new CreateFiles(this.courseID);
        const path = await createFiles.jsonPath();
        
        const index = PINECONE.index(INDEX);
        try{
            index.delete(delete_all=true, namespace=this.courseID); // delete all existing files for this course from vectorDB
        }catch(e){console.log(`deleting namespace error: ${e}`)};

        // add the new files to pinecone index
        const namespace = index.namespace(this.courseID); 
        const chunks = await this.getChunks(path);
        for (let i = 0; i < chunks.length; i++){
            const chunkEmbedding = await this.getEmbedding(JSON.stringify(chunks[i]));
            const record = { id: String(i), values: chunkEmbedding };
            await namespace.upsert([record]);
        }

        console.log("chunks uploaded: ", path);
        // Need local files for this pipeline
        // fs.unlink(path, (err) => {
        //     if (err) {
        //         console.error("Error deleting file:", err);
        //     } else {
        //         console.log("Local file deleted successfully");
        //     }
        // });
        
        return this.courseID;
    }

    async getChunks(path) {
        let text = "";
        try {
            text = fs.readFileSync(path, 'utf-8');
        } catch (err) {
            console.error('Error reading the file:', err);
        }
        const chunks = await JSON.parse(text);
        return chunks;
    }

    async getEmbedding(chunk) {
        const url = 'https://api.openai.com/v1/embeddings';
        // openai embeddings endpoint does not have type definitions as far as I can tell, so we use 'any' for data dependent on that endpoint, but the function must return an embedding
        const data = {
            input: chunk,
            model: 'text-embedding-ada-002',
        };
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonData = await response.json();
            return jsonData.data[0].embedding;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

module.exports = CourserAIAssistant;