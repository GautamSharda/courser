const Course = require('../models/course');
const CreateFiles = require('./CreateFiles');
const MongoClient = require('mongodb').MongoClient;
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
        this.transcripts = await this.createFiles();
        return;
    }

    async askQuestion(message, thread) {
        console.log("Asking question: ", message);
        const msgEmbedding = await this.getEmbedding(message);
        const index = PINECONE.index(INDEX);
        const namespace = index.namespace(this.courseID); 
        console.log("namespace: ", namespace);
        const pineconeRes = await namespace.query({topK: 3, vector: msgEmbedding});
        console.log(pineconeRes)
        const matches = pineconeRes.matches;
        console.log(matches)
        
        const course = await Course.findById(this.courseID);
        let chunks = await this.getTranscriptionByCourseId(this.courseID);
        chunks = chunks.text;
        // console.log("chunks: ", chunks.length);
        const relevantChunks = [];
        const documents = [];
        for (const match of matches){
            const relevantChunk = chunks[Number(match.id)];
            // console.log("relevant chunk: ", relevantChunk)
            relevantChunks.push(relevantChunk);
            const combinedText = relevantChunk.title + "\n" + relevantChunk.text + "\n" + relevantChunk.link;
            documents.push(new Document({ text: combinedText }));
        }


        // Specify LLM model
        const serviceContext = serviceContextFromDefaults({
            llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
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
            sources.push({
                url: chunk.link,
                title: chunk.title,
                type: "YouTube",
                number: i
            })
        }

        const response = answer + "\n" + JSON.stringify(sources);
        console.log(`q: ${message}`, "\n", `a: ${response}`);

        return { answer: answer, sources: sources };
    }

    async createFiles() {
        console.log("creating files");
        const createFiles = new CreateFiles(this.courseID);
        console.log("courseID: ", this.courseID);
        
        const index = PINECONE.index(INDEX);
        try{
            index.delete(delete_all=true, namespace=this.courseID); // delete all existing files for this course from vectorDB
        }catch(e){console.log(`deleting namespace error: ${e}`)};

        // add the new files to pinecone index
        const namespace = index.namespace(this.courseID); 
        const chunks = await this.getTranscriptionByCourseId(this.courseID);
        for (let i = 0; i < chunks.length; i++){
            const chunkEmbedding = await this.getEmbedding(JSON.stringify(chunks[i]));
            const record = { id: String(i), values: chunkEmbedding };
            await namespace.upsert([record]);
        }

        // console.log("chunks uploaded: ", path);
        // Need local files for this pipeline
        // fs.unlink(path, (err) => {
        //     if (err) {
        //         console.error("Error deleting file:", err);
        //     } else {
        //         console.log("Local file deleted successfully");
        //     }
        // });
        
        return chunks;
    }

    // async getChunks(path) {
        
    // }
    

    async getTranscriptionByCourseId(courseId) {
        const dbName = 'test';
        const collectionName = 'transcriptions';

        try {
            const client = await MongoClient.connect(process.env.MONGO_URI);
            const db = client.db(dbName);
            const collection = db.collection(collectionName);

            const transcription = await collection.findOne({ courseID:courseId });

            client.close();

            return transcription;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
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