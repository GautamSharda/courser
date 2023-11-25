const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChunkSchema = new Schema({
    text: { type: String, required: true },
    link: { type: String, required: true },
    sourceId: {type: String, required: true},
});

const SourceSchema = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: false},
    chunks: [{ type: ChunkSchema, default: [] }],
    courseId: { type: String, required: true },
})

module.exports = mongoose.model('Source', SourceSchema)