const axios = require('axios');

// load balancer ip
const TARGET_URL = 'http://Mongo-DB-Load-Balancer-1169857861.ap-southeast-2.elb.amazonaws.com/data';

function generateSensorData() {
    return {
        temperature: (Math.random() * 10 + 20).toFixed(2),  // Simulates a temperature between 20 to 30°C
        humidity: (Math.random() * 25 + 50).toFixed(2),    // Simulates a humidity between 50 to 75%
        timestamp: new Date().toISOString() // data timestamp
    };
}

async function sendData() {
    // generate the random data
    const data = generateSensorData();
    console.log('Data: ', data);

    // post the data to the load balancer
    try {
        const response = await axios.post(TARGET_URL, data);
        console.log(`Data sent successfully:`, data);
    } catch (error) {
        console.error(`Failed to send data:`, error.message);
    }
}

// Send simulated data every 5 seconds
const data = setInterval(sendData, 5000);