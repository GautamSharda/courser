// import the required dependencies
require("dotenv").config();
const OpenAI = require("openai");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Create a OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

async function askQuestion(question) {
  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
    const list = await openai.files.list();

    for await (const file of list) {
        console.log(file);
    }
    console.log(list)
    console.log('asdf')
  try {
    const assistant = await openai.beta.assistants.create({
      name: "Math Tutor",
      instructions:"You are a math tutor.",
      tools: [{"type": "retrieval"}],
      file_ids: ["file-ZaOYsGhyiT9Cz5n1RaMIqo2r", "file-ZaOYsGhyiT9Cz5n1RaMIqo2r"],
      model: "gpt-4-1106-preview",
    });
    console.log(assistant);

    // Log the first greeting
    console.log(
      "\nHello there, I'm your personal math tutor. Ask some complicated questions.\n"
    );

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Use keepAsking as state for keep asking questions
    let keepAsking = true;
    while (keepAsking) {
      const userQuestion = await askQuestion("\nWhat is your question? ");

      // Pass in the user question into the existing thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userQuestion,
      });

      // Use runs to wait for the assistant response and then retrieve it
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      let runStatus = await openai.beta.threads.runs.retrieve  (
        thread.id,
        run.id
      );

      // Polling mechanism to see if runStatus is completed
      // This should be made more robust.
      while (runStatus.status !== "completed") {
        console.log(runStatus);
        await new Promise((resolve) => setTimeout(resolve, 200));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }
      console.log(runStatus);
      // Get the last assistant message from the messages array
      const messages = await openai.beta.threads.messages.list(thread.id);
      console.log('-------------------');
      console.log(messages);

      // Find the last message for the current run
      console.log(messages.data[0].content);
      const lastMessageForRun = messages.data.filter((message) => message.run_id === run.id && message.role === "assistant").pop();

      // If an assistant message is found, console.log() it
      if (lastMessageForRun) {
        console.log(`${lastMessageForRun.content[0].text.value} \n`);
      }

      // Then ask if the user wants to ask another question and update keepAsking state
      const continueAsking = await askQuestion(
        "Do you want to ask another question? (yes/no) "
      );
      keepAsking = continueAsking.toLowerCase() === "yes";

      // If the keepAsking state is falsy show an ending message
      if (!keepAsking) {
        console.log("Alrighty then, I hope you learned something!\n");
      }
    }

    // close the readline
    readline.close();
  } catch (error) {
    console.error(error);
  }
}

// Call the main function
main();