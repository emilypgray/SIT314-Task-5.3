const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3000;

// specify the atlas connection string
const uri = "mongodb+srv://egra5170:kea1aBNus7zZc6Ke@cluster0.i1q5aw9.mongodb.net/?retryWrites=true&w=majority";

let db;
// create new mongo client
const client = new MongoClient(uri);

// attempt a connection with the database
async function initializeMongoConnection() {
    try {
        await client.connect();
        db = client.db("sit314database");
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.error("Failed to establish MongoDB connection:", error);
        process.exit(1);
    }
}

app.use(bodyParser.json());

// Health check endpoint for target server
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// receive the data over http
app.post('/data', async (req, res) => {
    const data = req.body;
    // print out the received data
    console.log('Received data: ', data);

    const dataCollection = db.collection('sensor_data');

    // insert the data into the collection
    try {
        const result = await dataCollection.insertOne({
            temperature: data.temperature,
            humidity: data.humidity,
            timestamp: data.timestamp
        });

        // print out indication of successful insertion
        if (result && result.acknowledged) {
            console.log('Data saved to MongoDB with ID: ', result.insertedId);
            res.status(201).send('Data saved!');
        } else {
            console.error('Data might not have been saved correctly: ', result);
            res.status(500).send('Failed to save data');
        }

    } catch (error) {
        console.error(`Failed to save data to MongoDB:`, error.message);
        res.status(500).send('Failed to save data');
    }
});

// wait for the mongo connection to be established and then print out the port the server is running on
app.listen(PORT, async () => {
    await initializeMongoConnection();
    console.log(`Server is running on port ${PORT}`);
});