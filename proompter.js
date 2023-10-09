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
            "content": `You are a top K most potentially useful file object id picker. Given an array of file objects, a question string, and an integer k, you must output an array of id's of the K file objects in the given array that could be the most useful for answering the question. You are just making a guess, and do not have to be right.
            Here is what a file object may look like: {"id":"dd905bbe6d4691428b461265", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"}. Some file objects may look a bit different, but they all will have an id and a summary. Don't hesitate to pick different looking file objects as long as they have an id.
            Remember, you must never output anything other than 1 array of size K containing K id's of K file objects from the given array that are most useful for answering the question. Since your job is just to make your best guess, you must never output 0 id's or say that you cannot answer the question because there is no information. Always output an id regardless of whether or not there is information. Do not output the actual files themselves, only their id. Obviously, the id be in the array, do not make it up.`
      },
      {
            "role": "user",
            "content": `fileObjects=[{"id":"720a0801f7c1ce8af7a567ac", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"id":"720a0801f7c1ce8af7a567ac", "display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"id:763350767a1c1a1311aeb8b7", "display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"id":"5fef640983c93d7f800dae01", "display_name":"1506_Week1_Intro and Basics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"id":"b7b51c8fbe0534d540930f42", "display_name":"ARTH 1070 DOE Syllabus_Fall 2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1 Fall23 Art of Asia"},{"id":"1defe14ea0e19dce90913dc4", "display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall20 Theory of Computation"},{"id":"4a24bf416ea4440f66a38db4", "display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"id":"0f399d35fa62e716408df511", "display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"}], 
            questionString="What textbooks do I need for all my courses", k=3`
      },
      {
            "role": "assistant",
            "content": `["720a0801f7c1ce8af7a567ac", "763350767a1c1a1311aeb8b7", "b7b51c8fbe0534d540930f42"]`
      },

      {
            "role": "user",
            "content": `fileObjects=[{"id":"953d1937264194bfda0f98a0", "display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAA Fall20 Discrete Structures"},{"id":"4dfea1330feb5f99ac6d8e31", "display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAA Fall23 Networks"},{"id":"a29f88f8385d741c38bb4845", "display_name":"JPNS_1506_Syllabus - Full_Fa 2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"id":"e47e93953158937a188c26af", "display_name":"1506_Week1_Intro and Basics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAA Fall23 Ghostly Japan"},{"id":"40bf6bef3319b0e35954dec7", "display_name":"ARTH 1070 DOE Syllabus_Fall 2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1 Fall23 Art of Asia"},{"id":"ce957b587ff827735253ed5b", "display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall20 Theory of Computation"},{"id":"5afe09a77d1be5e3db4eb3a2", "display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"},{"id":"795bafa956394d56a80cf233", "display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAA Fall23 Theory of Computation"}], 
            questionString="Who are all my professors for my courses", k=3`
      },
      {
            "role": "assistant",
            "content": `["4dfea1330feb5f99ac6d8e31", "a29f88f8385d741c38bb4845", "795bafa956394d56a80cf233"]`
      },

      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAAFall20DiscreteStructures","id":"b47de6e6dce0508aeb5ce60b"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAAFall23Networks","id":"fa28096607a155770584fa0c"},{"display_name":"JPNS_1506_Syllabus-Full_Fa2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"5edb0538fa873aa935c9bae9"},{"display_name":"1506_Week1_IntroandBasics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"7103b69b4703754d3a73365b"},{"display_name":"ARTH1070DOESyllabus_Fall2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1Fall23ArtofAsia","id":"622c4f21e93d0e4730a64e7e"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall20TheoryofComputation","id":"f5eaf59ead0f32b1d0d64ef6"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"3edc9e544d2d34f756015aa3"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"657d7f816f78d60d6226f13b"}], 
            questionString="When are all my midterms or tests again?", k=3`
      },
      {
            "role": "assistant",
            "content": `["fa28096607a155770584fa0c", "5edb0538fa873aa935c9bae9", "657d7f816f78d60d6226f13b"]`
      },

      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"ee05ee708c8e1fbf15fe0dff"},{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAAFall20DiscreteStructures","id":"2a3a21a6e94827914cc4b726"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAAFall23Networks","id":"6962edd25cbaec58e13b8597"},{"display_name":"JPNS_1506_Syllabus-Full_Fa2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"94e3c27bfa36f1dc613e6093"},{"display_name":"inclass-9-30.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"d571057d78da5e2d918af915"},{"display_name":"1506_Week1_IntroandBasics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"6eb3a7ae9493f3930c186d83"},{"display_name":"ARTH1070DOESyllabus_Fall2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1Fall23ArtofAsia","id":"332ff98404c797062d52e837"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall20TheoryofComputation","id":"61dcb8d52f583faa14d207aa"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"3521b8d6bce4ee04ec3249aa"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"793385f33a4a8b2fa0faa636"}],
            questionString="I couldn’t go to class today. Have the lecture notes for Theory of Computation been posted yet?", k=4`
      },
      {
            "role": "assistant",
            "content": `["ee05ee708c8e1fbf15fe0dff", "d571057d78da5e2d918af915", "61dcb8d52f583faa14d207aa", "3521b8d6bce4ee04ec3249aa"]`
      },
      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"54a971324193867cb33fc559"},{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAAFall20DiscreteStructures","id":"84af19528bc953f1692acb49"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAAFall23Networks","id":"65246ac3f5c7ee4077bd7f4a"},{"display_name":"JPNS_1506_Midterm2_Study_Guide.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"2be16fd8591a43c4fbfd8b45"},{"display_name":"JPNS_1506_Syllabus-Full_Fa2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"f9d1ffdbb61ae7fdca8493f4"},{"display_name":"inclass-9-30.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"0e213622c15f62860039d90d"},{"display_name":"1506_Week1_IntroandBasics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"562c7697bd57fdbcaf1fc285"},{"display_name":"ARTH1070DOESyllabus_Fall2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1Fall23ArtofAsia","id":"3f9571c9e520c2a7661ff167"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall20TheoryofComputation","id":"c21e5d86878fc72e912b62ed"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"301061d158742c4afdf1e26d"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"1acb6f9127eb53b504fab5f1"},{"display_name":"JPNS_1506_Midterm1_Study_Guide.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"8b30881ceb624ad7fc2d909a"}],
            questionString="What materials posted on Canvas are relevant to my next Ghostly Japan midterm?", k=2`
      },
      {
            "role": "assistant",
            "content": `["2be16fd8591a43c4fbfd8b45", "8b30881ceb624ad7fc2d909a"]`
      },

      {
            "role": "user",
            "content": `fileObjects=[{"display_name":"week6-context-free-grammars.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"f6dc8d3900870e87ff653ad1"},{"display_name":"lec5-metrics.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:2210:0AAAFall20DiscreteStructures","id":"73c765499dc9c0f2bd71c04f"},{"display_name":"cs3640-syllabus.pdf","created_at":"2023-08-30T21:54:21Z","summary":"Summary","course_name":"CS:3640:0AAAFall23Networks","id":"20a594c0e3a4f61bcf7977fd"},{"display_name":"JPNS_1506_Midterm2_Study_Guide.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"cbfbd437f9990798eb5e62cd"},{"display_name":"JPNS_1506_Syllabus-Full_Fa2023_UPDATED.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"8396d6f3879a35535347153a"},{"display_name":"inclass-9-30.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"4590dd48e7c64bae84ced77d"},{"display_name":"1506_Week1_IntroandBasics_Fa23.pptx","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"f454b63c9f18cdf7b2eb00c2"},{"display_name":"ARTH1070DOESyllabus_Fall2023.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"ARTH:1070:0AA1Fall23ArtofAsia","id":"391428eb8b6f0d8ab506355a"},{"display_name":"hw2.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall20TheoryofComputation","id":"0765e6bec3e359fd811fcf59"},{"display_name":"inclass-8-22.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"8801491173ff5d29b91d6d76"},{"display_name":"syllabus.pdf","created_at":"2023-09-05T21:54:21Z","summary":"Summary","course_name":"CS:4330:0AAAFall23TheoryofComputation","id":"f67483b40d2347910cd3a7d7"},{"display_name":"JPNS_1506_Midterm1_Study_Guide.docx","created_at":"2023-09-01T21:54:21Z","summary":"Summary","course_name":"JPNS:1506:0AAAFall23GhostlyJapan","id":"521c7a55b6bd95621a871f17"}], 
            questionString="What homework do I have to do for Theory of Computation?", k=2`
      },
      {
            "role": "assistant",
            "content": `["0765e6bec3e359fd811fcf59", "f67483b40d2347910cd3a7d7"]`
      },
]

module.exports = Proompter;