const Course = require('../models/course');
const Transcription = require('../models/transcription');
const fs = require('fs');


class CreateFiles {
    constructor(courseID) {
        this.courseID = courseID;
    }
    async jsonPath() {
        const transcriptions = await this.getJSON();
        const json = JSON.stringify(transcriptions);
        //write json to file with random name in `files` dir and return path
        const fileName = Math.random().toString(36).substring(2, 22);
        const path = `files/${fileName}.json`;
        const course = await Course.findById(this.courseID);
        course.filepath = path;
        await course.save();

        const jsonFile = new Promise((resolve, reject) => {
            fs.writeFile(path, json, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(path);
                }
            });
        });
        await jsonFile;
        return path;
    }

    async getJSON() {
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