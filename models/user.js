const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', default: [] }],
});

module.exports = mongoose.model('User', UserSchema)