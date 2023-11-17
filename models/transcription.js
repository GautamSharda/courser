const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//schema with text, duration, start time, and link
const TextSchema = new Schema({
    text: { type: String, required: true },
    link: { type: String, required: true },
});

const TranscriptionSchema = new Schema({
    title: { type: String, required: true },
    text: [{ type: TextSchema, default: [] }],
    courseID: { type: String, required: true },
    
});

module.exports = mongoose.model('Transcription', TranscriptionSchema)