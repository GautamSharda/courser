const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    openAIAssistantID: { type: String, default: '' },
    instructions: { type: String, default: 'You are a helpful AI assistant for a University classroom that answers questions for students about this course' },
    color: { type: String, default: '#fecc4e' },
    name: { type: String, default: '' },
    placeholder: { type: String, default: 'What is significant about horseshoe crabs' },
    backgroundImg: { type: String, default: 'https://res.cloudinary.com/dlk3ezbal/image/upload/v1699589098/jqmlca7vhr0cnzgdbaah.png' },
    openAIFiles: { type: [String], default: [] },
    transcriptions: [{ type: Schema.Types.ObjectId, ref: 'Transcription', default: [] }],
    chatHistory: Schema.Types.Mixed,
    filepath: String,
    openAIKey: {type: String, default: ''},
    sourceFiles: { type: [String], default: [] },
});

module.exports = mongoose.model('Course', CourseSchema)