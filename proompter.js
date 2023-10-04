const { Configuration, OpenAIApi } = require("openai");
class Proompter {
      constructor() {
            const configuration = new Configuration({
                  apiKey: process.env.OPENAI_API_KEY
            });
            this.openai = new OpenAIApi(configuration);
      }

      pickTopKFiles = async (files, query, k) => {
            console.log('hit picker');
            const prompt = `fileObjects=${JSON.stringify(files)}, questionString=${query}, k=${k}`;
            topKInstructions.push({ "role": "user", "content": prompt });
            const completion = await this.openai.createChatCompletion({
                  model: 'gpt-3.5-turbo',
                  temperature: 0,
                  messages: topKInstructions
            });
            const remaining = completion.data.choices[0].message.content;
            console.log('picked indices', remaining);
            return JSON.parse(remaining);
      }
}

let topKInstructions = [
      {
            "role": "system",
            "content": `As a file objects picker, you receive an array of file objects, a question string, and an integer k. Your task is to output an array of indices representing the top K file objects most useful for answering the question.

            A file object is defined as follows: {"display_name":"...", "created_at":"...", "summary":"...", "course_name":"..."}.

            Consider the fields display_name, created_at, summary, and course_name to determine usefulness.

            Ensure the output is a single array of size K, containing indices of the selected file objects.`
      },
      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"1506_Week1_Intro and Basics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"ARTH 1070 DOE Syllabus_Fall 2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1 Fall23 Art of Asia"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall20 Theory of Computation"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"}], 
            questionString="What textbooks do I need for all my courses", k=3`
      },
      {
            "role": "assistant",
            "content": `[1, 2, 7]`
      },

      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"1506_Week1_Intro and Basics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"ARTH 1070 DOE Syllabus_Fall 2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1 Fall23 Art of Asia"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall20 Theory of Computation"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"}], 
            questionString="Who are all my professors for my courses", k=3`
      },
      {
            "role": "assistant",
            "content": `[1, 2, 7]`
      },

      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"1506_Week1_Intro and Basics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"ARTH 1070 DOE Syllabus_Fall 2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1 Fall23 Art of Asia"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall20 Theory of Computation"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"}], 
            questionString="When are all my midterms or tests again?", k=3`
      },
      {
            "role": "assistant",
            "content": `[1, 2, 7]`
      },

      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"inclass-9-30.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"1506_Week1_Intro and Basics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"ARTH 1070 DOE Syllabus_Fall 2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1 Fall23 Art of Asia"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall20 Theory of Computation"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"}],
            questionString="I couldn’t go to class today. Have the lecture notes for Theory of Computation been posted yet?", k=4`
      },
      {
            "role": "assistant",
            "content": `[0, 4, 7, 8]`
      },
      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"display_name":"JPNS_1506_Midterm2_Study_Guide.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"inclass-9-30.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"1506_Week1_Intro and Basics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"ARTH 1070 DOE Syllabus_Fall 2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1 Fall23 Art of Asia"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall20 Theory of Computation"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"JPNS_1506_Midterm1_Study_Guide.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"}],
            questionString="What materials posted on Canvas are relevant to my next Ghostly Japan midterm?", k=2`
      },
      {
            "role": "assistant",
            "content": `[3, 11]`
      },

      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"display_name":"JPNS_1506_Midterm2_Study_Guide.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"inclass-9-30.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"1506_Week1_Intro and Basics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"display_name":"ARTH 1070 DOE Syllabus_Fall 2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1 Fall23 Art of Asia"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall20 Theory of Computation"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"display_name":"JPNS_1506_Midterm1_Study_Guide.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"}], 
            questionString="What homework do I have to do for Theory of Computation?", k=2`
      },
      {
            "role": "assistant",
            "content": `[8, 10]`
      },
]

module.exports = Proompter;