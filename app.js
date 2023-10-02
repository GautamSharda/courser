//require dotenv
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  const express = require("express");
  const http = require("http");
  const cors = require("cors");
  const app = express();
  const bodyParser = require("body-parser");
  const mongoose = require("mongoose");
  const Routes = require("./routes");
  const cookieParser = require("cookie-parser");
  const fileUpload = require('express-fileupload');
  const dataProvider = require('./dataProvider');
  const { MongoClient, ServerApiVersion } = require('mongodb');
  
  mongoose.set('strictQuery', true);
  mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  });
  
  const db = mongoose.connection;
  db.on("error", (message) => {
      console.log(message)
      console.error("Error connecting to database");
  });
  db.once("open", () => {
      console.log("✅ Database connected");
  });

  const initPatrick = async () => {
    const clientPatrick = new MongoClient(process.env.MONGO_URI_PATRICK, {serverApi: {version: ServerApiVersion.v1,deprecationErrors: true,}});
    await clientPatrick.connect();
    console.log("✅ Patrick's Database connected because partick is cool");
    const clientPatrickDB = clientPatrick.db('test');
    global.coursesCollections = clientPatrickDB.collection('courses');
  }
  initPatrick();

  app.use(fileUpload());
  app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors({credentials: true, origin: ["http://localhost:3000", "https://courser-beta.vercel.app/"]}));
  app.use("", Routes);
  
  const server = http.createServer(app);
  

  // var myHeaders = new Headers();
  // const url = 'canvas.instructure.com'
  // myHeaders.append("Authorization", "Bearer 4298~OHGzN84mcQqz9LbO5VGjy0L0jVkx8jykipHX9UTMvIOIf3XQ9lAKdmjaK5z4VFwI");

  // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

  // var requestOptions = {
  //   method: 'GET',
  //   headers: myHeaders,
  //   redirect: 'follow'
  // };

  // fetch(`https://canvas.instructure.com/api/v1/courses`, requestOptions)
  //   .then(response => response.json())
  //   .then(result => console.log(result))
  //   .catch(error => console.log('error', error));
  
  // const call = async () => {
  //   const canvas = new Canvas("4298~OHGzN84mcQqz9LbO5VGjy0L0jVkx8jykipHX9UTMvIOIf3XQ9lAKdmjaK5z4VFwI");
  //   const courses = await canvas.findCourses();
  //   const { id } = courses[courses.length - 1];
  //   const specificCourse = await canvas.findFilesFromCourse(id);
  //   const files = await canvas.writeFiles();
  //   console.log(specificCourse);
  // }
  // call();


  let PORT = process.env.PORT;
  if (PORT == null || PORT == "") {
    PORT = 8000;
  }
  
  server.listen(PORT, () => {
    return console.log(`✅ We're live: ${PORT}`);
  });
  