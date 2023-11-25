const Course = require('../models/course');
const Source = require("../models/source");
const { MongoClient } = require('mongodb');
const fs = require('fs');
require("dotenv").config();

// only used in OAI Assistant

class CreateFiles {
    constructor(courseID) {
        this.courseID = courseID;
    }

    async generateTranscripts() {
        const course = await Course.findById(this.courseID);
        const transcriptionIDs = course.transcriptions;
        const transcriptions = [];
        for (let id of transcriptionIDs){
            const transcription = await Transcription.findById(id);
            const chunks = transcription.text;
            for (let chunk of chunks){
                const newChunk = {title: transcription.title, text: chunk.text, link: chunk.link};
                transcriptions.push(newChunk);
            }
        }
        return transcriptions;
    }
}

module.exports = CreateFiles;