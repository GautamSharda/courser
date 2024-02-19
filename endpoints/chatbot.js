if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const { isLoggedIn, asyncMiddleware } = require("../middleware");
const Chatbot = express.Router();
const User = require("../models/user");
const Course = require("../models/course");
const YouTubePipeline = require("../classes/YoutubePipeline");
const CourserAIAssistant = require("../classes/CourserAIAssistant");

//create a get route that has query params for the course id and thread_id (optional) and then in the body of the request, the query
Chatbot.post('/chat', asyncMiddleware(async (req, res) => {
    const { courseID, thread_id, query } = req.body;
    // res.json({ answer: "hello", thread_id: 'thread-id123' });
    // return 

    const course = await Course.findById(courseID);
    const openAIKey = course.openAIKey || process.env.OPENAI_API_KEY
    const assistant = new CourserAIAssistant(courseID, openAIKey);
    const response = await assistant.askQuestion(query, thread_id);
    res.json(response);
}));

Chatbot.post('/create', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { youtubeUrls, name } = req.body;
    const user = res.userProfile;

    const newCourse = new Course({name});
    await newCourse.save();

    const courseId = newCourse._id.toString();

    const youtubePipeline = new YouTubePipeline(courseId, youtubeUrls);
    const course = await youtubePipeline.getCaptions(); // This code smells. A function called getCaptions() should return Captions. Instead, it's returning a Course, which is surely not appropriately used.

    const assistant = new CourserAIAssistant(courseId, process.env.OPENAI_API_KEY);
    await assistant.newCourseConfig();

    user.courses.push(courseId);
    await user.save();

    res.json({ course });
}));

module.exports = Chatbot;