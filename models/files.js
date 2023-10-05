const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({

    buffer: { 
      type: Buffer,
      required: true
    },
  
    fileName: {
      type: String,
      required: true
    }
  
  },
  {
    bufferCommands: true // enable buffer storage
  });

module.exports = mongoose.model('File', FileSchema)