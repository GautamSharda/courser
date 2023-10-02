const { Configuration, OpenAIApi } = require("openai");
class Proompter {
      constructor() {
            const configuration = new Configuration({
                apiKey: process.env.OPENAI_API_KEY
            });
            this.openai = new OpenAIApi(configuration);
        }

    pickTopKFiles = async(files, query, k) => {
        const prompt = `fileObjects=${files}, questionString=${query}, k=${k}`
        const completion = await this.openai.createChatCompletion({
            model: 'gpt-3.5-turbo-16k',
            temperature: 0,
            messages: topKInstructions.push(prompt)
      });
      const remaining = completion.data.choices[0].message.content;
      console.log(remaining);
      return remaining;
    }
}

let topKInstructions = [
    {
          "role": "system",
          "content": `You are a top K most logically useful file objects picker. Given an array of file objects, a question string, and an integer k, you must output an array of indices of the K file objects in the given array that would be most useful for answering the question. Here is what a file object looks like: {}. 
          Remember, you must never output anything other than 1 array of size K containing K indices of K file objects from the given array that are most useful for answering the question.`},
    {
          "role": "user",
          "content": `fileObjects=[], questionString="", k=3`
      },
    {
          "role": "assistant",
          "content": `[{ID: DBCD:3000, Title: Ant History, Instructor: john bob, Time: 9:00pm - 10:30pm}, {ID: CS:2300, Title: Networks, Instructor: Rishab, Time: 10:30am - 12:00pm}, {ID: CS:3620, Title: Computer Architecture, Instructor: Goddard, Time: 4:30pm - 5:20pm}, {ID: CS:1210, Title: Fundamentals, Instructor: HEHEHEHA. Time: 2:00pm - 2:30pm}]`
    },

    {
          "role": "user",
          "content": `Constraints=[Don't return any classes that start at or before 9am, I only want history geneds, I want to take Networks, replace ant history with a gen-ed for art], potentialCourses={
          geneds: [{Art: [{ID: ART:1111, Title: Art Class, Instructor: Missy, Time: 9:00am - 3:00pm MWF}, {ID: ART:1231, Title: Advanced Art Class, Instructor: Missy 2, Time: 9:30pm - 10:30pm}]}, {History: [{ID: ANTH:2100, Title: Anthropology and Contemporary World Problems, Instructor: billy bob, Time: 9:00am - 10:30am}, {ID: ABCD:2150, Title: World Problems, Instructor: billy doe, Time: 10:00am - 11:30am}, {ID: DBCD:3000, Title: Ant History, Instructor: john bob, Time: 9:00pm - 10:30pm}]}],
          core: [{ID: CS:2300, Title: Networks, Instructor: Rishab, Time: 10:30am - 12:00pm TTh}, {ID: CS:3330, Title: Algorithms, Instructor: Denise, Time: 11:30am - 12:45pm}, {ID: CS:3620, Title: Computer Architecture, Instructor: Goddard, Time: 4:30pm - 5:20pm}, {ID: CS:1210, Title: Fundamentals, Instructor: HEHEHEHA. Time: 2:00pm - 2:30pm TTh}]}`},
    {
          "role": "assistant",
          "content": `[{ID: ART:1111, Title: Art Class, Instructor: Missy, Time: 9:00pm - 10:30pm MWF}, {ID: CS:2300, Title: Networks, Instructor: Rishab, Time: 10:30am - 12:00pm TTh}, {ID: CS:3620, Title: Computer Architecture, Instructor: Goddard, Time: 4:30pm - 5:20pm}, {ID: CS:1210, Title: Fundamentals, Instructor: HEHEHEHA. Time: 2:00pm - 2:30pm TTH}]`
    },

    {
          "role": "user",
          "content": `Constraints=[I don't want any classes past 5pm, I want to take any class with Professor Goddard], potentialCourses={
                      geneds: [{Art: [{ID: ART:1111, Title: Art Class, Instructor: Missy, Time: 9:00am - 3:00pm}, {ID: ART:1231, Title: Advanced Art Class, Instructor: Missy 2, Time: 10:45pm - 12:15pm}]}, {History: [{ID: ANTH:2100, Title: Anthropology and Contemporary World Problems, Instructor: billy bob, Time: 9:00am - 10:30am}, {ID: ABCD:2150, Title: World Problems, Instructor: billy doe, Time: 10:00am - 11:30am}, {ID: DBCD:3000, Title: Ant History, Instructor: john bob, Time: 9:00pm - 10:30pm}]}],
                      core: [{ID: CS:2300, Title: Networks, Instructor: Goddard, Time: 6:00pm - 12:00pm}, {ID: CS:3330, Title: Algorithms, Instructor: Denise, Time: 11:30am - 12:45pm}, {ID: CS:3620, Title: Computer Architecture, Instructor: Goddard, Time: 4:00pm - 5:00pm}, {ID: CS:1210, Title: Fundamentals, Instructor: HEHEHEHA. Time: 2:00pm - 2:30pm}, {ID: CS:3620, Title: Computer Architecture, Instructor: John Doe, Time: 4:00pm - 5:00pm}, {ID: CS:1100, Title: CS Fundamentals, Instructor: Mayer, Time: 3:00pm - 3:45pm}]}`},
    {
          "role": "assistant",
          "content": `[{ID: ANTH:2100, Title: Anthropology and Contemporary World Problems, Instructor: billy bob, Time: 9:00am - 10:30am}, {ID: ART:1231, Title: Advanced Art Class, Instructor: Missy 2, Time: 10:45pm - 12:15pm}, {ID: CS:3620, Title: Computer Architecture, Instructor: Goddard, Time: 4:00pm - 5:00pm}, {ID: CS:1210, Title: Fundamentals, Instructor: HEHEHEHA. Time: 2:00pm - 2:30pm},  {ID: CS:1100, Title: CS Fundamentals, Instructor: Mayer, Time: 3:00pm - 3:45pm}]`
    },

    {
          "role": "user",
          "content": `Constraints=[I don't want any classes past 5pm, I want to take any class with Professor Goddard, Replace CS fundamentals with a different CS course], potentialCourses={
    geneds: [{Art: [{ID: ART:1111, Title: Art Class, Instructor: Missy, Time: 9:00am - 3:00pm}, {ID: ART:1231, Title: Advanced Art Class, Instructor: Missy 2, Time: 10:45pm - 12:15am}]}, {History: [{ID: ANTH:2100, Title: Anthropology and Contemporary World Problems, Instructor: billy bob, Time: 9:00am - 10:30am}, {ID: ABCD:2150, Title: World Problems, Instructor: billy doe, Time: 10:00am - 11:30am}, {ID: DBCD:3000, Title: Ant History, Instructor: john bob, Time: 9:00pm - 10:30pm}]}],
    core: [{ID: CS:2300, Title: Networks, Instructor: Goddard, Time: 6:00pm - 12:00pm}, {ID: CS:3330, Title: Algorithms, Instructor: Denise, Time: 11:30am - 12:45pm}, {ID: CS:3620, Title: Computer Architecture, Instructor: Goddard, Time: 4:00pm - 5:00pm}, {ID: CS:1210, Title: Fundamentals, Instructor: HEHEHEHA. Time: 2:00pm - 2:30pm}, {ID: CS:3620, Title: Computer Architecture, Instructor: John Doe, Time: 4:00pm - 5:00pm}, {ID: CS:1100, Title: CS Fundamentals, Instructor: Mayer, Time: 3:00pm - 3:45pm}]}`},
    {
          "role": "assistant",
          "content": `[{ID: ANTH:2100, Title: Anthropology and Contemporary World Problems, Instructor: billy bob, Time: 9:00am - 10:30am}, {ID: ART:1231, Title: Advanced Art Class, Instructor: Missy 2, Time: 10:45pm - 12:15am}, {ID: CS:3620, Title: Computer Architecture, Instructor: Goddard, Time: 4:00pm - 5:00pm}, {ID: CS:1210, Title: Fundamentals, Instructor: HEHEHEHA. Time: 2:00pm - 2:30pm},  {ID: CS:3330, Title: Algorithms, Instructor: Denise, Time: 11:30am - 12:45pm}]`
    },
]

module.exports = Proompter;