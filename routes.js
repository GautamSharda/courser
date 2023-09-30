if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const Routes = express.Router();
const user = require("./models/user");
const fs = require("fs/promises");
const { Document, VectorStoreIndex, SimpleDirectoryReader } = require("llamaindex");

Routes.post("/home", async (req, res) => {
    res.json("newuser");
    // const { canvasToken } = req.body;
    // let existingUser = await user.findOne({ canvasToken });
    // if (existingUser) {
    //     res.json(existingUser);
    // } else {
    //     let newUser = await user.create({ canvasToken });
    //     res.json(newUser);
    // }
});


Routes.post('/upload', async (req, res) => {
    try {
        const { canvasToken, files } = req.body;
        // save file to uploads directory
        // const fileNameNoDot = file.name.split('.')[0];
        // const filePath = path.join(__dirname, 'uploads', fileNameNoDot + file.md5 + '.pdf');
        // await file.mv(filePath);
    
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
    
    const essay = await fs.readFile(
        "data/test.txt",
        "utf-8",
      );
    
    // Create Document object with essay
    const document = new Document({ text: essay });
    
    // Split text and create embeddings. Store them in a VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments([document]);

    // Query the index
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query(
        "What is the author's name?",
    );

    // Output response
    console.log(response.toString());    

    const foundUser = await user.findOne({ canvasToken });
    // foundUser.questions.push(prompt);
    // await foundUser.save();
    res.json(foundUser);
});

Routes.use((err, req, res, next) => {
    console.log(err); // Log the stack trace of the error
    res.status(500).json({ error: `Internal error: ${err.message}` });
});

module.exports = Routes;