const { MongoClient } = require('mongodb');
const fs = require('fs');
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// MongoDB
const mongoClient = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
    try {
        // Connect to MongoDB
        await mongoClient.connect();
        const db = mongoClient.db('test');
        const collection = db.collection('users');
        // iterate through all users and print all their questions
        const cursor = collection.find({});
        await cursor.forEach(user => {
            console.log(user.questions);
            //iterate through questions and append each to ./questions.txt
            user.questions.forEach(question => {
                console.log(question)
                fs.appendFile('./questions.txt', question + "\n", function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
            });
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Ensure the MongoDB client is closed
        await mongoClient.close();
    }
})();