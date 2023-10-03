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
const DataProvider = require("./dataprovider");

Routes.post("/home", async (req, res) => {
    const { canvasToken } = req.body;
    let existingUser = await user.findOne({ canvasToken });
    if (existingUser) {
        res.json(existingUser);
    } else {
        let newUser = await user.create({ canvasToken });
        postCanvasData(canvasToken);
        res.json(newUser);
    }
});

/** 
 * TODO: Pull all files from Canvas, construct the File object, put it in DB under the newUser 
 * Owner: Ilya 
 */
postCanvasData = async (canvasToken) => {
    const summaryPrompt = "Summarize the contents of this document in 3 sentences. Classify it as lecture, practice test, project, syllabus, etc. Be consise and without filler words."

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

    res.json(foundUser);

    console.log('we are hitting');
    console.log(canvasToken);
    console.log(prompt);

    // find K most relevant files from  user.personalData, user.canvasData, UIOWAData, combine corresponding vectors, query
    const kMostRelevant = getTopKRelevant(prompt, canvasToken, k);

    for (file in kMostRelevant){
        const fileName = `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}.txt`;
        if (file.rawText){
            const fileText = file.rawText;
            if (!fs.existsSync(`./data/${canvasToken}`)){
                fs.mkdirSync(`./data/${canvasToken}`);
            }
            fs.writeFileSync(`./data/${canvasToken}/${fileName}`, fileText);
        }
    }

    const documents = await new SimpleDirectoryReader().loadData({directoryPath: `./data/${canvasToken}`});
    console.log(documents);

    const index = await VectorStoreIndex.fromDocuments(documents);

    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        prompt,
    );

    const answer = response.toString();
    console.log(answer);    

    const foundUser = await user.findOne({ canvasToken });
    foundUser.questions.push(prompt);
    foundUser.responses.push(answer);
    await foundUser.save();

});

getTopKRelevant = async (query, canvasToken, k) => {
    const dataProvider = new DataProvider(canvasToken);
    const canvasFiles = await dataProvider.getCanvasFiles();
    const personalFiles = await dataProvider.getPersonalFiles();
    const collegeFiles = await dataProvider.getCollegeFiles();

    const allFiles = canvasFiles;
    // const allFiles = canvasFiles.concat(personalFiles).concat({type:"collegefile", fileContent:collegeFiles});

    const proompter = new Proompter();
    const topKIndices = proompter.pickTopKFiles(allFiles, query, k);
    let topKFiles = [];
    topKIndices.forEach(index => topKFiles.push(allFiles[index]));

    return topKFiles;
}


Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = Routes;