if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const Routes = express.Router();
const user = require("./models/user");
const fs = require("fs/promises");
const { Document, VectorStoreIndex, SimpleDirectoryReader } = require("llamaindex");
const Canvas = require("./classes/Canvas");
const { Configuration, OpenAIApi } = require("openai");
const Proompter = require("./proompter");
const dataProvider = require("./dataProvider");
const path = require('path');
const File = require("./models/files");
const { isLoggedIn, asyncMiddleware, randomStringToHash24Bits } = require("./middleware");
const jwt = require("jsonwebtoken");

Routes.get("/home", isLoggedIn, asyncMiddleware(async (req, res) => {
    const fileIds = res.userProfile.files;
    const files = [];
    for (const fileId of fileIds) {
        //get only the field fileName from the file object
        const fileName = await File.findById(fileId).select('fileName');
        files.push({name: fileName.fileName, id: fileId});
    }
    res.userProfile.files = files;
    res.json({user: res.userProfile});
}));

Routes.get("/isloggedin", isLoggedIn, asyncMiddleware(async (req, res) => {
    console.log('4');
    res.json({user: res.userProfile});
}));

/** 
 * TODO: Pull all files from Canvas, construct the File object, put it in DB under the newUser 
 * Owner: Ilya 
 */
postCanvasData = async (newUser, canvasToken) => {
    return;
}

Routes.post('/upload', isLoggedIn, asyncMiddleware(async (req, res) => {
    try {
        var files = req.files.file;
        //check if files in an arrray, if not make it an array
        if (!Array.isArray(files)) {
            files = [files];
        }
        // files doesn't seem right
        const mongoFiles = [];
        const fileIds = [];
        for (const myfile of files) {
            const fileNameNoDot = myfile.name.split('.')[0];
            const filePath = path.join(__dirname, 'userFiles', fileNameNoDot + myfile.md5 + '.pdf');
            await myfile.mv(filePath);
            const dp = new dataProvider(res.userProfile._id.toString());
            const uploadedFile = await dp.uploadFileToMongo(myfile);
            mongoFiles.push({name: uploadedFile.fileName, id: uploadedFile._id.toString()});
            fileIds.push(uploadedFile._id.toString());
            //const writePdf = await dp.createPdfFromMongoId(uploadedFile._id.toString(), 'data');
        }
        const foundUser = await user.findById(res.userProfile._id);
        foundUser.files = foundUser.files.concat(fileIds);
        await foundUser.save();
        console.log(foundUser);
        res.json({files: mongoFiles});
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Server error');
    }
}));


Routes.post('/accountCreation', async (req, res) => {
    const { idToken, email, name } = req.body;
    const uid = randomStringToHash24Bits(idToken);
    const foundUser = await user.findById(uid);
    if (!foundUser) {
        const newUser = new user({ _id: uid, email: email, name: name })
        await newUser.save();
    }
    const token = jwt.sign({ _id: uid, }, process.env.JWT_PRIVATE_KEY, { expiresIn: "1000d" });
    res.status(200).send({ token: token, message: 'Login successful' });
});


Routes.post('/answer', isLoggedIn, asyncMiddleware(async (req, res) => {
    const { prompt } = req.body;
    const currUser = res.userProfile;
    currUser.questions.push(prompt);
    await currUser.save();

    res.json(currUser);

    // console.log('we are hitting');
    // console.log(canvasToken);
    // console.log(prompt);

    // // find K most relevant files from  user.personalData, user.canvasData, UIOWAData, combine corresponding vectors, query
    // const kMostRelevant = getTopKRelevant(prompt, canvasToken, k);

    // downloadPDFs(kMostRelevant);

    // const documents = await new SimpleDirectoryReader().loadData({directoryPath: "./data"});
    // console.log(documents);

    // const index = await VectorStoreIndex.fromDocuments(documents);

    // const queryEngine = index.asQueryEngine();
    // const response = await queryEngine.query(
    //     prompt,
    // );

    // console.log(response.toString());    

    // const foundUser = await user.findOne({ canvasToken });
    // foundUser.questions.push([prompt, response]);
    // await foundUser.save();

}));

getTopKRelevant = async (query, canvasToken, k) => {
    const dataProvider = new DataProvider(canvasToken);
    const canvasFiles = await dataProvider.getCanvasFiles();
    const personalFiles = await dataProvider.getPersonalFiles();
    const UIFiles = await dataProvider.getUIFiles();

    const allFiles = canvasFiles.concat(personalFiles).concat(UIFiles);

    const proompter = new Proompter();
    const topKIndices = proompter.pickTopKFiles(allFiles, query, k);
    let topKFiles = [];
    topKIndices.forEach(index => topKFiles.push(allFiles[index]));

    return topKIndices;
}


Routes.post('/test', async (req, res) => {
    downloadPDFs(req.body.files);
});

downloadPDFs = async(files) => {
    console.log(files);
    files.forEach(file = async() => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    let response = await fetch(file.url, requestOptions);
    // download PDFs from url
    // override whatever is in ./data
    })

}

Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = Routes;