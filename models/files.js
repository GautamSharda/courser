const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({

    id: {
      type: String,
      required: false
    },

    buffer: { 
      type: Buffer,
      required: false
    },
  
    display_name: {
      type: String,
      required: true
    },

    url: {
      type: String,
      required: false
    },

    created_at: {
      type: String,
      required: false
    },

    course_name: {
      type: String, 
      required: false
    },

    summary: {
      type: String,
      required: true
    },

    rawText: {
      type: String,
      required: true
    },

    owner: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: false
    }
  },
  {
    bufferCommands: true, // enable buffer storage,
    strict: false
  });

module.exports = mongoose.model('File', FileSchema)