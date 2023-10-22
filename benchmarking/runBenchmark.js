//read bench1.json and iterate throught it
const fs = require('fs');
const axios = require('axios');
const math = require('mathjs');
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

let profile = fs.readFileSync('./dumps/userProfile.json', 'utf-8');


// LLM will be the model used for scoring the generated answer against the sample answer
const evaluationLLM = 'gpt-3.5-turbo';
async function getAnswer(question, expected, generatedAnswer) {
    const messages = [];
    messages.push({
        role: "user",content: `Goal: Rate the generated answer based on how well it aligns with the sample answer, with 1 being the lowest and 5 being the highest rating. \nQuestion: ${question} \nSample Answer: ${expected}] \nGenerated Answer: ${generatedAnswer} \nRate the Generated Answer (1-5), dont respond with anything but an integer:`,
    });

    const completion = await openai.createChatCompletion({
        model: evaluationLLM,
        temperature: 0,
        messages: messages
    });
    const remaining = completion.data.choices[0].message.content;
    return remaining;
}



fs.readFile('./benchmarking/bench1.json', 'utf8', async (err, data) => {
    if (err) {
        return console.error(err);
    }
    
    const benchmarksJson = JSON.parse(data);

    let results = [];
    const benchmarkPromises = benchmarksJson.flatMap(benchmarkObject => 
        benchmarkObject.questions.map(async (benchmark) => {
            try {
                const res = await axios.post('http://localhost:8000/answerTest', {
                    body: benchmark.question,
                    userProfile: profile
                });
                
                let question = benchmark.question;
                let expected = benchmark.answer;
                let generatedAnswer = res.data.finalAnswer;

                let score = await getAnswer(question, expected, generatedAnswer);
                console.log(`Question: ${question} \nExpected Answer: ${expected} \nGenerated Answer: ${generatedAnswer} \nScore: ${score}\n\n`);
                
                results.push({
                    question: question,
                    expected: expected,
                    generatedAnswer: generatedAnswer,
                    score: score
                });
            } catch (error) {
                console.error(error);
            }
        })
    );
    
    await Promise.all(benchmarkPromises);
    console.log(results);
    fs.writeFileSync('./benchmarking/rawResults.json', JSON.stringify(results));
    // make a report in a text file, include total questions, correct (score >=3), incorrect (score<3), and percentage correct, average score, sd of scores
    let totalQuestions = results.length;
    let correct = 0;
    let incorrect = 0;
    let totalScore = 0;
    results.forEach(result => {
        if (Number(result.score) >= 3) {
            correct++;
        } else {
            incorrect++;
        }
        totalScore += Number(result.score);
    });
    let percentageCorrect = correct / totalQuestions;
    let averageScore = totalScore / totalQuestions;
    let scores = results.map(result => Number(result.score));
    let sd = math.std(scores);
    let report = `Courser Answers Benchmark\n------------------------------------\nTotal Questions: ${totalQuestions}\nCorrect (Score>=3): ${correct}\nIncorrect (Score<3): ${incorrect}\nPercentage Correct: ${percentageCorrect}\nAverage Rating: ${averageScore}\nStd. Dev. of Scores: ${sd}\n------------------------------------`;
    report += `n\nEvalutation LLM: ${evaluationLLM}`
    fs.writeFileSync('./benchmarking/report.txt', report);
});
