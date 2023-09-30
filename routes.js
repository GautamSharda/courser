if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const Routes = express.Router();


Routes.get("/home", asyncMiddleware(async (req, res) => {
    console.log('home');
    res.json({home:  'home'})
}));

Routes.post('/upload', async (req, res) => {
    try {
        console.log('upload')
        res.json({files:'files'});
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Server error');
    }
});


Routes.post('/answer', async (req, res) => {
    try {
        console.log('answer')
        res.json({answer:'answer'});
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Server error');
    }
});

Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = routes;