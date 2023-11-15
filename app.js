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
  const Auth = require("./endpoints/auth");
  const Chatbot = require("./endpoints/chatbot");
  const CourseRouter = require("./endpoints/course");
  const cookieParser = require("cookie-parser");
  const fileUpload = require('express-fileupload');
  
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
      console.log("👉 👌 Database did the deed");
  });

  app.use(fileUpload());
  app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors({credentials: true, origin: ["http://localhost:3000", "https://courser-beta.vercel.app", "https://chatcourser.com"]}));
  app.use("/auth", Auth);
  app.use("/chatbot", Chatbot);
  app.use("/course", CourseRouter);
  
  app.use((err, req, res, next) => {
    res.status(500).send('Something went wrong');
});

let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 8000;
}

app.listen(PORT, () => {
  console.log(`🚀 Running this bitch on ${PORT}`)
});

  