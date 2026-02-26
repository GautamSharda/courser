if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const { isLoggedIn, asyncMiddleware } = require("../middleware");
const Chatbot = express.Router();
const User = require("../models/user");
const Course = require("../models/course");
const Conversation = require("../models/conversation");
const YouTubePipeline = require("../classes/YoutubePipeline");
const CourserAIAssistant = require("../classes/CourserAIAssistant");

//create a get route that has query params for the course id and thread_id (optional) and then in the body of the request, the query
Chatbot.post('/chat', asyncMiddleware(async (req, res) => {
    const { courseID, thread_id, query } = req.body;

    const course = await Course.findById(courseID);
    const openAIKey = course.openAIKey || process.env.OPENAI_API_KEY
    const assistant = new CourserAIAssistant(courseID, openAIKey);
    const response = await assistant.askQuestion(query, thread_id);

    const conversation = new Conversation({
        courseId: courseID,
        message: query,
        response: response.answer,
    });
    await conversation.save();

    res.json(response);
}));

function escapeCsvCell(value) {
    if (value == null) return '';
    const s = String(value).replace(/"/g, '""');
    return /[,"\n\r]/.test(s) ? `"${s}"` : s;
}

Chatbot.get('/:courseId/dataset/count', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { courseId } = req.params;
    const count = await Conversation.countDocuments({ courseId });
    res.json({ count });
}));

Chatbot.get('/:courseId/dataset/export', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { courseId } = req.params;
    let limit = Math.min(100, Math.max(10, parseInt(req.query.limit, 10) || 50));
    if (isNaN(limit)) limit = 50;

    const conversations = await Conversation.find({ courseId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    const headers = ['Start Time', 'User Question', 'Assistant Answer'];
    const rows = [headers.map(escapeCsvCell).join(',')];

    for (const conv of conversations) {
        const createdAt = conv.createdAt ? new Date(conv.createdAt).toISOString() : '';
        const row = [
            escapeCsvCell(createdAt),
            escapeCsvCell(conv.message ?? ''),
            escapeCsvCell(conv.response ?? ''),
        ];
        rows.push(row.join(','));
    }

    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dataset-${courseId}-${Date.now()}.csv"`);
    res.send(csv);
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