const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in your .env file.');
    process.exit(1);
  }

  try {
    console.log('--------------------------------------------------');
    console.log('ATTEMPTING TO CONNECT TO MONGO DB...');
    console.log(`Using MONGO_URI: ${process.env.MONGO_URI ? 'FOUND' : 'NOT FOUND'}`);
    console.log('--------------------------------------------------');

        console.log('--- Mongoose Connection Details ---');
    console.log('URI:', process.env.MONGO_URI);
    console.log('-----------------------------------');

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('--------------------------------------------------');
    console.log(`SUCCESS! MongoDB Connected: ${conn.connection.host}`);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('Error connecting to MongoDB. Full error object:');
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
