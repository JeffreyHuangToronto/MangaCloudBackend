/**
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 *
 * @format
 */
require("dotenv").config();

const { MongoClient, Db } = require("mongodb");
const uri = process.env.MONGODBURI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectDB() {
  console.log("Connecting to my Database...");
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected!");
    // Make the appropriate DB calls
  } catch (e) {
    console.error(e);
  }
}

connectDB().catch(console.error);

module.exports = client;
