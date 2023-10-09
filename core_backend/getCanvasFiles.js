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
  // Connect to MongoDB
  await mongoClient.connect()
  const db = mongoClient.db('test');
  const users = db.collection('users');
  // grab user in mongo by field canvasToken
  const user = await users.findOne({ canvasToken: "4298~qowt8cwFmVmCb3VwmPmizSi6U3oIqLyhTNcnGSoHbo4iFLOX1jlN16KzGRlpjhoB" });
  let combinedArray = [].concat(...Object.values(user.files));
  combinedArray = combinedArray.map(({ display_name, created_at, course_name, summary }) => ({ display_name, created_at, course_name,summary }));
  return(combinedArray)
})();