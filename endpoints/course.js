if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const { isLoggedIn, asyncMiddleware } = require("../middleware");
const CourseRouter = express.Router();
const Course = require("../models/course");
const cloudinary = require('cloudinary').v2;


CourseRouter.get('/getAllCourses', isLoggedIn, asyncMiddleware(async (req, res) => {
    const user = res.userProfile;
    const courses = await Course.find({ _id: { $in: user.courses } });
    res.json({ courses });
}));

//create a route that takes in a course id and returns the course
CourseRouter.get('/getCourse/:courseID', asyncMiddleware(async (req, res) => {
    const { courseID } = req.params;
    const course = await Course.findById(courseID);
    res.json(course);
}));

CourseRouter.post('/update',isLoggedIn, asyncMiddleware(async (req, res) => {
    const { courseID, name, placeholder, color, instructions, openAIKey } = req.body;
    const data = { name, placeholder, color, instructions, openAIKey };

    // Check if an image file is included in the request
    const image = req?.files?.image;
    if (image !== undefined) {
        const upload = async (image) => {
          //const buffer = await fs.readFile(image.path);
            const dataUri = `data:image/png;base64,${image.data.toString('base64')}`;
             return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(dataUri, (error, result) => {
                    if (result) {
                      resolve(result);
                    } else {
                        reject(error);
                    }
                });
            });
        };
        const result = await upload(image);
        if (result.secure_url) {
            data.backgroundImg = result.url;
        }
    }
    const updatedCourse = await Course.findOneAndUpdate({ _id: courseID }, { $set: { ...data } }, { new: true });
    res.json(updatedCourse);
}));


CourseRouter.get('/getCourseProtected/:courseID', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { courseID } = req.params;
    const course = await Course.findById(courseID);
    res.json(course);
}));

module.exports = CourseRouter;