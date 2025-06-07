const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definido en el archivo .env');
    }

    // Connect with retry logic
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30
      // Mongoose 6+ no longer needs these options
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    
    // Set up connection error handler for future connection issues
    mongoose.connection.on('error', (err) => {
      console.error(`Error de conexión MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado - intentando reconectar...');
    });

    return conn;
  } catch (error) {
    console.error(`Error conectando a MongoDB: ${error.message}`);
    console.error('Asegúrate de que tu IP esté en la lista blanca de MongoDB Atlas');
    console.error('Visita: https://www.mongodb.com/docs/atlas/security-whitelist/');  
    // Don't immediately exit - just return null so the server can still start
    // and provide meaningful error responses
    return null;
  }
};

module.exports = connectDB;
