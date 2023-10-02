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

Routes.post("/home", async (req, res) => {
    const { canvasToken } = req.body;
    let existingUser = await user.findOne({ canvasToken });
    if (existingUser) {
        res.json(existingUser);
    } else {
        let newUser = await user.create({ canvasToken });
        postCanvasData(newUser, canvasToken);
        res.json(newUser);
    }
});

/** 
 * TODO: Pull all files from Canvas, construct the File object, put it in DB under the newUser 
 * Owner: Ilya 
 */
postCanvasData = async (newUser, canvasToken) => {
    return;
}

Routes.post('/upload', async (req, res) => {
    try {
        const { canvasToken, files } = req.body;
        // files doesn't seem right
        for (const file of files) {
            // save file to uploads directory
            console.log(file);
            const fileNameNoDot = file.name.split('.')[0];
            const filePath = path.join(__dirname, 'userFiles', fileNameNoDot + file.md5 + '.pdf');
            await file.mv(filePath);
        }

        // const agent = new Agent(filePath, '', []);
        // const plans = await agent.ready();
        let foundUser = await user.findOne({ canvasToken });
        res.json(foundUser);
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Server error');
    }
});


Routes.post('/answer', async (req, res) => {
    const { canvasToken, prompt } = req.body;

    console.log('we are hitting');
    console.log(canvasToken);
    console.log(prompt);

    const foundUser = await user.findOne({ canvasToken });
    foundUser.questions.push(prompt);
    await foundUser.save();

    res.json(foundUser);

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

});

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