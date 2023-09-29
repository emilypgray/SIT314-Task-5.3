const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3000;

// mongoDB atlas connection string
const atlasUri = "mongodb+srv://egra5170:kea1aBNus7zZc6Ke@cluster0.i1q5aw9.mongodb.net/?retryWrites=true&w=majority";
// location of local host
const localUri = "mongodb://localhost:27017/";

let atlasDb;
let localDb;
// create clients for both online and local mongodb
const atlasClient = new MongoClient(atlasUri);
const localClient = new MongoClient(localUri);

let lastTimestamp = null;

async function initializeMongoConnection() {
    // connect to databases
    try {
        await atlasClient.connect();
        atlasDb = atlasClient.db("sit314database");
        console.log("Successfully connected to MongoDB Atlas");

        await localClient.connect();
        localDb = localClient.db("localdatabase");
        console.log("Successfully connected to Local MongoDB");
    } catch (error) {
        console.error("Failed to establish MongoDB connection:", error);
        process.exit(1);
    }
}


async function fetchNewDataFromAtlasAndStoreLocally() {
    // collection names
    const atlasCollection = atlasDb.collection('sensor_data');
    const localCollection = localDb.collection('sensor_data');

    // only get data from MongoDB Atlas with a timestamp greater than the last timestamp retrieved
    // this prevents the server from pulling the entire online database every time
    const query = lastTimestamp ? { timestamp: { $gt: lastTimestamp } } : {};
    const newData = await atlasCollection.find(query).toArray();

    if (newData.length > 0) {
        // insert the data into the local database
        await localCollection.insertMany(newData);
        console.log(`Stored ${newData.length} new records in local database.`);

        // update last timestamp with the most recent timestamp in the online data
        lastTimestamp = newData[newData.length - 1].timestamp;
        console.log('Latest timestamp:', lastTimestamp);
    } else {
        console.log('No new data found.');
    }
}

app.use(bodyParser.json());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// query MongoDB Atlas once every minute for new data
setInterval(async () => {
    try {
        await fetchNewDataFromAtlasAndStoreLocally();
    } catch (error) {
        console.error(`Failed to fetch data from MongoDB Atlas and save to local MongoDB:`, error.message);
    }
}, 60000);

app.listen(PORT, async () => {
    await initializeMongoConnection();
    console.log(`Server is running on port ${PORT}`);
});