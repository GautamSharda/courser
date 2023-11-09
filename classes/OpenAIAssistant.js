const OpenAI = require('openai');
const Course = require('../models/course');
const CreateFiles = require('./CreateFiles');
const fs = require('fs');
const openai = new OpenAI();


class OpenAIAssistant {
    constructor(courseID) {
        this.courseID = courseID;
    }

    async newCourseConfig() {
        await this.createFiles();
        await this.createAssistant();
        return;
    }
    
    async askQuestion(query, thread_id = undefined) {
        const course = await Course.findById(this.courseID);
        var threadID = thread_id;
        if (!threadID) {
            const thread = await openai.beta.threads.create();
            threadID = thread.id;
        }
        await openai.beta.threads.messages.create(threadID, {role: "user", content: query});
        const run = await openai.beta.threads.runs.create(threadID, {assistant_id: course.openAIAssistantID});
        let runStatus = await openai.beta.threads.runs.retrieve(threadID, run.id);

        while (runStatus.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 20));
            runStatus = await openai.beta.threads.runs.retrieve(threadID, run.id);
        }
        const messages = await openai.beta.threads.messages.list(threadID);
  
        // Find the last assistant message for this run
        const lastMessageForRun = messages.data.filter((message) => message.run_id === run.id && message.role === "assistant").pop();
  
        // If an assistant message is found, console.log() it
        if (lastMessageForRun) {
            return {thread_id: threadID, answer:lastMessageForRun.content[0].text.value };
        } else {
            return {thread_id: threadID, answer:"Oops, something went wrong." };
        }
    }
    async createAssistant() {
        const course = await Course.findById(this.courseID);
        if (course.openAIAssistantID) {
            await openai.beta.assistants.del(course.openAIAssistantID);
        }
        const assistant = await openai.beta.assistants.create({
            instructions: course.instructions,
            tools: [{"type": "retrieval"}],
            file_ids: course.openAIFiles,
            model: "gpt-4-1106-preview",
        });
        course.openAIAssistantID = assistant.id;
        await course.save();
    }

    async createFiles() {
        const createFiles = new CreateFiles(this.courseID);
        const path = await createFiles.jsonPath();
        const openAIFile = await openai.files.create({
            file: fs.createReadStream(path),
            purpose: "assistants",
        });
        const course = await Course.findById(this.courseID);
        for (let files of course.openAIFiles) {
            await openai.files.delete(files);
        }
        course.openAIFiles = [openAIFile.id];
        await course.save();
        console.log(path);
        // Deleting the local file
        fs.unlink(path, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("Local file deleted successfully");
            }
        });
        
        return course;
    }
}

module.exports = OpenAIAssistant;