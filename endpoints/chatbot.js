if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const { isLoggedIn, asyncMiddleware } = require("../middleware");
const Chatbot = express.Router();
const User = require("../models/user");
const Course = require("../models/course");
const YouTubePipeline = require("../classes/YoutubePipeline");
const OpenAIAssistant = require("../classes/OpenAIAssistant");


//create a get route that has query params for the course id and thread_id (optional) and then in the body of the request, the query
Chatbot.get('/ask', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { query, thread_id } = req.query;
    const { courseID } = req.body;
    const assistant = new OpenAIAssistant(courseID);
    const response = await assistant.askQuestion(query, thread_id);
    res.json({ response });
}));

Chatbot.post('/create', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { youtubeUrls } = req.body;
    const user = res.userProfile
    console.log(user);
    const newCourse = new Course();
    await newCourse.save();

    const courseId = newCourse._id.toString();
    console.log(courseId);
    const youtubePipeline = new YouTubePipeline(courseId, youtubeUrls);
    const course = await youtubePipeline.getCaptions();
    user.courses.push(courseId);
    await user.save();

    const assistant = new OpenAIAssistant(courseId);
    await assistant.run();

    res.json({ course });
}));

module.exports = Chatbot;