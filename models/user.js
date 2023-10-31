const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: { type: String, required: true },
    canvasToken: { type: String, required: false },
    files : { type: Array, default: [] },
    personalFiles: { type: Array, default: [] },
    questions : { type: [String], default: [] },
    responses : { type: [String], default: [] },
    classJson: { type: Array, default: [] },
});

module.exports = mongoose.model('User', UserSchema)