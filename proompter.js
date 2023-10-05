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
                  model: 'gpt-4',
                  temperature: 0,
                  messages: topKInstructions
            });
            const remaining = completion.data.choices[0].message.content;
            console.log('picked indices', remaining);
            try {
            return JSON.parse(remaining);
            }catch(e){
                  console.log('picker error', e);
            };
            return [];
      }
}

let topKInstructions = [
      {
            "role": "system",
            "content": `You are a top K most potentially useful file object indices picker. Given an array of file objects, a question string, and an integer k, you must output an array of indices of the K file objects in the given array that could be the most useful for answering the question. You are just making a guess, and do not have to be right.
            Here is what a file object looks like: {"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"}.
            Remember, you must never output anything other than 1 array of size K containing K indices of K file objects from the given array that are most useful for answering the question. Since your job is just to make your best guess, you must never output 0 indices or say that you cannot answer the question because there is no information. Always output an index regardless of whether or not there is information. Do not output the actual files themselves, only their indices.`
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