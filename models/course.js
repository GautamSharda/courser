const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    openAIAssistantID: { type: String, default: '' },
    instructions: { type: String, default: 'You are a helpful AI assistant for a University classroom that answers questions for students about this course' },
    color: { type: String, default: '#fdf7c3' },
    backgroundImg: { type: String, default: '' },
    openAIFiles: { type: [String], default: [] },
    transcriptions: [{ type: Schema.Types.ObjectId, ref: 'Transcription', default: [] }],

});

module.exports = mongoose.model('Course', CourseSchema)