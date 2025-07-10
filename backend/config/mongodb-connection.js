const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// Simple connection function that matches the original interface
const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definido en el archivo .env');
    }

    // Connect to MongoDB with improved options
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      family: 4,
      maxPoolSize: 10,
    };
    
    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
    logger.info(`MongoDB Conectado: ${conn.connection.host}`);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error(`Error de conexión MongoDB: ${err.message}`);
      console.error(`Error de conexión MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado - intentando reconectar...');
      console.log('MongoDB desconectado - intentando reconectar...');
      
      // Attempt reconnection after a delay
      setTimeout(() => {
        console.log('Intentando reconectar a MongoDB...');
        connectDB().catch(err => console.error('Error en reconexión:', err.message));
      }, 5000);
    });

    return conn;
  } catch (error) {
    logger.error(`Error conectando a MongoDB: ${error.message}`);
    console.error(`Error conectando a MongoDB: ${error.message}`);
    console.error('Asegúrate de que tu IP está en la lista blanca de MongoDB Atlas');
    console.error('Visita: https://www.mongodb.com/docs/atlas/security-whitelist/');
    return null;
  }
};

module.exports = connectDB;
