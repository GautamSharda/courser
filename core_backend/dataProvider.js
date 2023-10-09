// A high level class to orchestrate all our data queries across all our sources
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const File = require("../models/files");
const PDFDocument = require('pdfkit');
const pdf = require('pdf-parse');
const { Document, VectorStoreIndex, SummaryIndex, serviceContextFromDefaults, OpenAI } = require("llamaindex");
const User = require("../models/user");
const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
const { firestore } = require("firebase-admin");

const summaryPrompt = "Summarize the contents of this document in 3 sentences. Classify it as lecture, practice test, project, syllabus, etc. Be consise and without filler words."



class DataProvider{
    constructor(userID) {
      this.userID = userID;
    }

    getCanvasFileMetadata = async (idd=false) => {
      const user = await User.findById(this.userID);

      let ids = user.files;
      let combinedArray = [];
      for (let i = 0; i < ids.length; i++){
        const id = ids[i];
        const fileDoc = await File.findById(id);
        const file = fileDoc.toObject();
        file._id = String(id);
        combinedArray.push(file);
      }
      if (idd){
        // Include raw text
        combinedArray = combinedArray.map(({ id }) => ({ id, rawText }));
      }else{
        combinedArray = combinedArray.map(({_id, display_name, url, created_at, course_name, summary }) => ({_id, display_name, url, created_at, course_name,summary }));
      }
      
      return(combinedArray)
    }

    fetchRawTextOfFile = async(id) => {
      let objid = new ObjectId(id);
      console.log(objid);
      const file = await File.findById(objid);
      if (file){
        return file.rawText;
      }
      console.log('no file found');
      return '';
    }

    fetchURL = async(id) => {
      let objid = new ObjectId(id);
      console.log(objid);
      const file = await File.findById(objid);
      if (file){
        return file.preview_url ? file.preview_url : file.display_name;
      }
      console.log('no file');
      return '';
    }


   embedding = async (value) => {
    //guys who call openai through fetch, are the types of guys who steal your girl
        const url = 'https://api.openai.com/v1/embeddings';
        let response = await fetch(url, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({input: value, model: 'text-embedding-ada-002'})
        })
        if (response.ok) {
            let responseData = await response.json();
            const embedding = responseData.data[0].embedding;
            return embedding;
        }
        throw new Error('Request failed!');
      };

   queryMongoVectorDB = async (query) => {
        //const embedding = await this.embedding(query);
        const cursor = global.coursesCollections.aggregate([
                {
                  $search: {
                    index: "courses",
                    text: {
                      query: query,
                      path: {
                        wildcard: "*"
                      }
                    }
                  },
                },
                { $limit: 10 }
        ]);
        console.log(cursor);
        const documents = await cursor.toArray(); 
        console.log(documents);
        return documents;
    }

    courseJsonReducer = (courseJson) => {
        const newcourseJson = {
          session: courseJson.session ? courseJson.session : 'unknown',
          section: courseJson.section ? courseJson.section : 'unknown',
          course: courseJson.course ? courseJson.course : 'unknown',
          title: courseJson.title ? courseJson.title : 'unknown',
          semesterHours: courseJson.semesterHours ? courseJson.semesterHours : 'unknown',
          sun: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].sun)  ? "Sunday" : '',
          mon: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].mon)  ? "Monday" : '',
          tue: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].tue)  ? "Tuesday" : '',
          wed: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].wed)  ? "Wednesday" : '',
          thu: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].thu)  ? "Thursday" : '',
          fri: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].fri)  ? "Friday" : '',
          sat: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].sat)  ? "Saturday" : '',
          startTime: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].startTime) ? courseJson.timeAndLocations[0].startTime : 'unknown',
          endTime: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].endTime) ? courseJson.timeAndLocations[0].endTime : 'unknown',
          room: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].room) ? courseJson.timeAndLocations[0].room : 'unknown',
          building: (courseJson.timeAndLocations && courseJson.timeAndLocations[0] && courseJson.timeAndLocations[0].building) ? courseJson.timeAndLocations[0].building : 'unknown',
        };
        const summaryString = `${newcourseJson.title} takes place on${" " + newcourseJson.sun}${" " + newcourseJson.mon}${" " + newcourseJson.tue}${" " + newcourseJson.wed}${" " + newcourseJson.thu}${" " + newcourseJson.fri}${" " + newcourseJson.sat} from ${newcourseJson.startTime} to ${newcourseJson.endTime} in ${newcourseJson.room} in ${newcourseJson.building}. It is worth ${newcourseJson.semesterHours} credit hours. The course is ${newcourseJson.course}. The section is ${newcourseJson.section}. The session is ${newcourseJson.session}.`;
        return [newcourseJson, summaryString];
      }

      async writeFiles (myText) {
        const fileName = `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}.txt`;
        //create directory if it doesn't exist 
        if (!fs.existsSync(`./data/${this.userToken}`)){
            fs.mkdirSync(`./data/${this.userToken}`);
        }
        fs.writeFileSync(`./data/${this.userToken}/${fileName}`, myText);
        return `data/${this.userToken}/${fileName}`;
    }

    getCollegeFiles = async(query) => {
        const courseJSON = await this.queryMongoVectorDB(query);
        const courseJsons = courseJSON.map(this.courseJsonReducer);
        const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({model: 'gpt-3.5-turbo-16k',temperature: 0,messages: [{"role": "system","content": `You are a helpful AI assistant who helps students plan their schedules. You are given a list of courses (this includes their information) and a question from a student. Answer their question with the information provided`},{"role": "user","content": `Courses: ${JSON.stringify(courseJsons)}\n\n Question: ${query}`}]});
        const response = completion.data.choices[0].message.content;
        return response;
    }

    uploadFileToMongo = async (file) => {
      // get raw text, gen file summary
      
      let actualBuffer = Buffer.from(file.data);
      let data = await pdf(actualBuffer);
      console.log(data.text);

      let document = new Document({ text: data.text });

      // Specify LLM model
      const serviceContext = serviceContextFromDefaults({
          llm: new OpenAI({ model: "gpt-3.5-turbo-16k", temperature: 0 }),
      });
  
      // Indexing 
      let startTime = Date.now();
      const index = await SummaryIndex.fromDocuments([document], {serviceContext}); // LlamaIndex embedding
      // let index = await fetchEmbedding(document.text); // Openai embedding
      let endTime = Date.now();
      // console.log("Indexing took " + (endTime - startTime) + " milliseconds");
  
      // Query the index
      startTime = Date.now();
      const queryEngine = index.asQueryEngine();
      const response = await queryEngine.query(
          summaryPrompt,
      );
      endTime = Date.now();
      // console.log("Query took " + (endTime - startTime) + " milliseconds");
    
      const newFile = await File.create({buffer: actualBuffer, display_name: file.name, summary: response.toString(), rawText: data.text, owner: this.userID});    
      return newFile;
    }
    createPdfFromMongoId = async (fileId, outputPath) => {
        const file = await File.findById(fileId);
  
        console.log(file.buffer);
        // Get the Buffer directly
        const fileBuffer = Buffer.from(file.buffer);
  
        console.log(fileBuffer);
        // Validate it's a Buffer
        if(!(fileBuffer instanceof Buffer)) {
          throw new Error('Invalid file buffer');
        }
    
        var done = false;
        fs.writeFile(`${outputPath}/${file}`, fileBuffer, err => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('PDF written to output.pdf');
        });
        while (!done) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        return 'output.pdf';
      };

    getPersonalFiles = async() => {
      const user = await User.findById(this.userID);
      const personalFileIDs = user.personalFiles;
      console.log(personalFileIDs);
      let personalFiles = [];
      for (let i = 0; i < personalFileIDs.length; i++){
        let id = mongoose.Types.ObjectId(personalFileIDs[i]);
        console.log(id);
        const personalFileDoc = await File.findById(id);
        const personalFile = personalFileDoc.toObject();
        delete personalFile.buffer;
        delete personalFile.rawText;
        delete personalFile.owner;
        delete personalFile.display_name;
        personalFile._id = String(id);
        personalFiles.push(personalFile);
      }
      return personalFiles;
    }

}

module.exports = DataProvider;