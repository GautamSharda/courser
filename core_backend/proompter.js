/**
 * This file is responsible for generating the top K files for a given query.
 */

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
                  model: 'gpt-3.5-turbo-16k',
                  temperature: 0,
                  messages: topKInstructions
            });
            const remaining = completion.data.choices[0].message.content;
            console.log('picked ids', remaining);
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
          "content": `You are tasked with selecting the top K file IDs deemed most potentially useful for answering a given query. 
          Provided with an array of file objects, a question string, and an integer value k, your goal is to return an array containing the IDs of the K file objects from the given array that you speculate could be the most helpful in addressing the question. Your selection is speculative and doesn't have to be accurate.
          Here’s an example of what a file object might resemble: {
            "_id": "dd905bbe6d4691428b461265",
            "display_name": "lec5-metrics.pdf",
            "created_at": "2023-09-05T21:54:21Z",
            "summary": "Summary",
            "course_name": "CS:2210:0AAA Fall20 Discrete Structures"
          }. 
          File objects may vary in structure, but each one will possess an _id and a summary. Don't shy away from choosing diverse file objects, as long as they contain an _id.
          It's imperative that you return precisely one array of size K, encompassing K IDs of K file objects from the provided array perceived as most useful for answering the query. Avoid returning empty arrays or claiming the absence of information; always furnish an ID even if the relevance is uncertain. Your output should exclusively consist of file IDs from the given array, and should not include actual files, their names, or any fabricated IDs. Do an extra check to ensure you are not returning any display_name instead of _id. For example, you absolutely must not return something that ends with .pdf instead of something with a bunch of numbers and letters. Remember, an _id will always be a string of length 24 and will never contain anything other than one of the 26 english alphabet sybmols or number. Do not select any string with dashes or slashes or periods or funny looking alphabets or periods or the word pdf at the end.`
      },
      {
          "role": "user",
          "content": `fileObjects=[{"_id":"720a0801f7c1ce8af7a567ac", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"_id":"720a0801f7c1ce8af7a567ac", "display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"_id":"763350767a1c1a1311aeb8b7", "display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"}, ...], 
          questionString="What textbooks do I need for all my courses", k=3`
      },
      {
          "role": "assistant",
          "content": `["720a0801f7c1ce8af7a567ac", "763350767a1c1a1311aeb8b7", "b7b51c8fbe0534d540930f42"]`
      },
      {
          "role": "user",
          "content": `fileObjects=[{"_id":"953d1937264194bfda0f98a0", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"_id":"4dfea1330feb5f99ac6d8e31", "display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"_id":"a29f88f8385d741c38bb4845", "display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"}, ...], 
          questionString="Who are all my professors for my courses", k=3`
      },
      {
          "role": "assistant",
          "content": `["4dfea1330feb5f99ac6d8e31", "a29f88f8385d741c38bb4845", "795bafa956394d56a80cf233"]`
      },
      {
          "role": "user",
          "content": `fileObjects=[{"_id":"b47de6e6dce0508aeb5ce60b", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAAFall20DiscreteStructures"},{"_id":"fa28096607a155770584fa0c", "display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAAFall23Networks"},{"_id":"5edb0538fa873aa935c9bae9", "display_name":"JPNS_1506_Syllabus-Full_Fa2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan"}, ...], 
          questionString="When are all my midterms or tests again?", k=3`
      },
      {
          "role": "assistant",
          "content": `["fa28096607a155770584fa0c", "5edb0538fa873aa935c9bae9", "657d7f816f78d60d6226f13b"]`
      },
      {
          "role": "user",
          "content": `fileObjects=[{"_id":"ee05ee708c8e1fbf15fe0dff", "display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation"},{"_id":"2a3a21a6e94827914cc4b726", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAAFall20DiscreteStructures"},{"_id":"6962edd25cbaec58e13b8597", "display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAAFall23Networks"}, ...], 
          questionString="I couldn’t go to class today. Have the lecture notes for Theory of Computation been posted yet?", k=4`
      },
      {
          "role": "assistant",
          "content": `["ee05ee708c8e1fbf15fe0dff", "d571057d78da5e2d918af915", "61dcb8d52f583faa14d207aa", "3521b8d6bce4ee04ec3249aa"]`
      },
      {
          "role": "user",
          "content": `fileObjects=[{"_id":"54a971324193867cb33fc559", "display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation"},{"_id":"84af19528bc953f1692acb49", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAAFall20DiscreteStructures"},{"_id":"65246ac3f5c7ee4077bd7f4a", "display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAAFall23Networks"}, ...], 
          questionString="What materials posted on Canvas are relevant to my next Ghostly Japan midterm?", k=2`
      },
      {
          "role": "assistant",
          "content": `["2be16fd8591a43c4fbfd8b45", "521c7a55b6bd5f2fb5b7a79b"]`
      },
      {
          "role": "user",
          "content": `fileObjects=[{"_id":"a792ee4a13bd5e3fb3e9c92c", "display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation"},{"_id":"1b7e3e9d1e0b54ef9208b7a6", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAAFall20DiscreteStructures"},{"_id":"ee76192fcba6ea13ef1db5f0", "display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAAFall23Networks"}, ...], 
          questionString="How many total assignments are there in Discrete Structures?", k=5`
      },
      {
          "role": "assistant",
          "content": `["1b7e3e9d1e0b54ef9208b7a6", "9ad30e5c5d6d411be3f9c2dc", "417fa796c7d2ee1bf0c8b4ac", "9eb3aa1de79153f3a19e5817", "47b1b7c5f9a3ee2a9c7b5f1c"]`
      }
  ]  
          
module.exports = Proompter;