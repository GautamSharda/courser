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

Chatbot.get('/getAllCourses', isLoggedIn, asyncMiddleware(async (req, res) => {
    const user = res.userProfile;
    const courses = await Course.find({ _id: { $in: user.courses } });
    res.json({ courses });
}));

//create a route that takes in a course id and returns the course
Chatbot.get('/getCourse', asyncMiddleware(async (req, res) => {
    const { courseID } = req.query;
    const course = await Course.findById(courseID);
    res.json({ course });
}));

//create a get route that has query params for the course id and thread_id (optional) and then in the body of the request, the query
Chatbot.post('/ask', asyncMiddleware(async (req, res) => {
    const { courseID, thread_id, query } = req.body;
    // res.json({ answer: "hello", thread_id: 'thread-id123' });
    // return 
    const assistant = new OpenAIAssistant(courseID);
    const response = await assistant.askQuestion(query, thread_id);
    res.json(response);
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

    const assistant = new OpenAIAssistant(courseId);
    await assistant.newCourseConfig();

    user.courses.push(courseId);
    await user.save();

    res.json({ course });
}));

module.exports = Chatbot;