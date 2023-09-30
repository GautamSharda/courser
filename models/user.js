const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    canvasToken: { type: String, required: true },
    files : { type: Array, default: [] },
    questions : { type: [String], default: [] },
    responses : { type: [String], default: [] },
});

module.exports = mongoose.model('user', UserSchema)