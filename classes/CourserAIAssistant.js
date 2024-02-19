const Course = require('../models/course');
const Source = require("../models/source");
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const { Pinecone, Index, PineconeRecord, QueryResponse, ScoredPineconeRecord } = require('@pinecone-database/pinecone');
const { Document, SummaryIndex, ServiceContext, serviceContextFromDefaults, OpenAI, BaseQueryEngine, ContextChatEngine } = require("llamaindex");

const INDEX = "courser";
const PINECONE = new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY
});

class CourserAIAssistant {
    constructor(courseID, openAIKey) {
        this.courseID = courseID;
        this.openAIKey = openAIKey;
    }

    async newCourseConfig() {
        this.transcripts = await this.createFiles();
        return;
    }

    // TODO: add title 
    async askQuestion(message, thread_id) {
        const msgEmbedding = await this.getEmbedding(message);
        const index = PINECONE.index(INDEX);
        const namespace = index.namespace(this.courseID); 
        const pineconeRes = await namespace.query({topK: 3, vector: msgEmbedding});
        const matches = pineconeRes.matches;

        const chunks = await this.getChunks();
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
            llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0, apiKey: this.openAIKey }),
        });

        // Indexing
        const summaryIndex = await SummaryIndex.fromDocuments(documents, { serviceContext });
        // Make query
        const retriever = summaryIndex.asRetriever();
        const chatEngine = new ContextChatEngine({ retriever });
        const llamaResponse = await chatEngine.chat(
            message,
            thread_id ? thread_id : [],
        );
        const answer = llamaResponse.toString();

        const citations = []
        for (let i = 0; i < relevantChunks.length; i++) {
            const chunk = relevantChunks[i];
            const source = await Source.findById(chunk.sourceId);
            const timestamp = chunk.link.split("&t=")[1].split("s")[0];
            citations.push({
                url: chunk.link,
                title: source.name,
                type: source.type,
                seconds: timestamp % 60,
                minutes: Math.floor(timestamp / 60),
                number: i
            })
        }

        const response = answer + "\n" + JSON.stringify(citations);
        console.log(`q: ${message}`, "\n", `a: ${response}`);

        return { answer: answer, sources: citations, thread_id: chatEngine.chatHistory}; // eventually want to use citations: citations, instead of sources: citations
    }

    async createFiles() {        
        const index = PINECONE.index(INDEX);
        try{
            index.delete(delete_all=true, namespace=this.courseID); // delete all existing files for this course from vectorDB
        }catch(e){console.log(`deleting namespace error: ${e}`)};

        // add the new files to pinecone index
        const namespace = index.namespace(this.courseID); 
        let chunks = await this.getChunks();
        console.log(chunks);

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
    
    async getChunks() {
        const course = await Course.findById(this.courseID);
        const sourceIds = course.sourceFiles;
        // Create an array of promises for each source
        const sourcePromises = sourceIds.map(sourceId => Source.findById(sourceId));
        // Await all promises simultaneously for efficiency
        const sources = await Promise.all(sourcePromises);
        // Use flatMap to concatenate all chunks into a single array
        const allChunks = sources.flatMap(source => source.chunks || []);
        return allChunks;
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
                    'Authorization': `Bearer ${this.openAIKey}`,
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