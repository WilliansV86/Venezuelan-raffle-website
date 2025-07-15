console.log('Starting isolated database connection test...');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testDBConnection = async () => {
  if (!process.env.MONGO_URI) {
    console.error('TEST FAILED: MONGO_URI is not defined in the .env file.');
    return;
  }

  console.log('MONGO_URI found. Attempting to connect...');

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`SUCCESS: MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error('TEST FAILED: The connection threw an error. Full details below:');
    console.error(error);
  } finally {
    // Close the connection so the script can exit cleanly
    await mongoose.connection.close();
    console.log('Connection closed. Test finished.');
  }
};

testDBConnection();
