const { MongoClient } = require('mongodb');
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
        const collection = db.collection('files');

        // Delete documents and get the result
        const result = await collection.deleteMany({ owner: '5937f8a86561d3e9b06b86e0' });

        // Print the number of deleted documents
        console.log(`Deleted ${result.deletedCount} files for user.`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Ensure the MongoDB client is closed
        await mongoClient.close();
    }
})();