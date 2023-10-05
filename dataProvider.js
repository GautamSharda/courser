// A high level class to orchestrate all our data queries across all our sources
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const File = require("./models/files");
const PDFDocument = require('pdfkit');


const { MongoClient } = require('mongodb');
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// MongoDB
const mongoClient = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

class DataProvider{
    constructor(canvasToken) {
      this.userToken = canvasToken;
    }

    getCanvasFileMetadata = async (idd=false) => {
      await mongoClient.connect()
      const db = mongoClient.db('test');
      const users = db.collection('users');

      const user = await users.findOne({ canvasToken: this.userToken });

      let combinedArray = user.files;
      if (idd){
        // Include raw text
        combinedArray = combinedArray.map(({ id }) => ({ id, rawText }));
      }else{
        combinedArray = combinedArray.map(({id, display_name, url, created_at, course_name, summary }) => ({id, display_name, url, created_at, course_name,summary }));
      }
      
      return(combinedArray)
    }

    fetchRawTextOfFile = async(id) => {
      console.log(id);
      await mongoClient.connect()
      const db = mongoClient.db('test');
      const users = db.collection('users');

      const user = await users.findOne({ canvasToken: this.userToken });
      
      let combinedArray = user.files;

      let doc = combinedArray.find(item => String(item.id) === String(id));
      return doc.rawText;
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
      const newFile = await File.create({buffer: Buffer.from(file.data), fileName: file.name});    
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
      return {};
    }

}

module.exports = DataProvider;