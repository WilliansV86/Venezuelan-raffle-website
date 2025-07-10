const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// Keep track of connection state
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Connection options
const connectionOptions = {
  serverSelectionTimeoutMS: 30000, // Longer timeout
  socketTimeoutMS: 45000,         // Longer socket timeout
  heartbeatFrequencyMS: 10000,    // Check server health more often
  family: 4,                      // Force IPv4
  maxPoolSize: 10,                // Connection pool size
};

/**
 * Connects to MongoDB with retry logic
 */
const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definido en el archivo .env');
    }
    
    // If already connected, return the existing connection
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      logger.info('Using existing MongoDB connection');
      return mongoose.connection;
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
    // Success - reset reconnect attempts counter
    reconnectAttempts = 0;
    isConnected = true;
    
    // Log connection success
    logger.info(`MongoDB Conectado: ${conn.connection.host}`);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);

    // Set up MongoDB connection event handlers
    setupConnectionHandlers();
    
    return conn;
  } catch (error) {
    isConnected = false;
    logger.error(`Error conectando a MongoDB: ${error.message}`);
    console.error(`Error conectando a MongoDB: ${error.message}`);
    console.error('Asegúrate de que tu IP está en la lista blanca de MongoDB Atlas');
    console.error('Visita: https://www.mongodb.com/docs/atlas/security-whitelist/');
    
    // Don't exit - just return null so the server can still start
    return null;
  }
};

/**
 * Sets up MongoDB connection event handlers
 */
const setupConnectionHandlers = () => {
  const connection = mongoose.connection;
  
  // Remove any existing listeners to avoid duplicates
  connection.removeAllListeners();
  
  // Handle errors
  connection.on('error', (err) => {
    isConnected = false;
    logger.error(`Error de conexión MongoDB: ${err.message}`);
    console.error(`Error de conexión MongoDB: ${err.message}`);
    attemptReconnect();
  });

  // Handle disconnection
  connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB desconectado - intentando reconectar...');
    console.log('MongoDB desconectado - intentando reconectar...');
    attemptReconnect();
  });

  // Handle successful reconnection
  connection.on('reconnected', () => {
    isConnected = true;
    reconnectAttempts = 0;
    logger.info('MongoDB reconectado exitosamente');
    console.log('MongoDB reconectado exitosamente');
  });

  // Handle when connection is back to normal
  connection.on('connected', () => {
    isConnected = true;
    reconnectAttempts = 0;
    logger.info('MongoDB conexión establecida');
    console.log('MongoDB conexión establecida');
  });
};

/**
 * Attempts to reconnect to MongoDB with exponential backoff
 */
const attemptReconnect = async () => {
  // Don't attempt reconnection if we're already trying or have exceeded max attempts
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error(`Máximo de intentos de reconexión (${MAX_RECONNECT_ATTEMPTS}) alcanzado`);
    console.error(`Máximo de intentos de reconexión (${MAX_RECONNECT_ATTEMPTS}) alcanzado`);
    return;
  }
  
  reconnectAttempts++;
  
  // Calculate backoff time: 2^attempts * 1000ms (1s, 2s, 4s, 8s, etc.)
  const backoffTime = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000); // Max 30 seconds
  
  logger.info(`Intentando reconectar en ${backoffTime/1000} segundos (intento ${reconnectAttempts} de ${MAX_RECONNECT_ATTEMPTS})`);
  console.log(`Intentando reconectar en ${backoffTime/1000} segundos (intento ${reconnectAttempts} de ${MAX_RECONNECT_ATTEMPTS})`);
  
  // Wait using setTimeout
  setTimeout(async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }
    } catch (error) {
      logger.error(`Error en intento de reconexión: ${error.message}`);
      console.error(`Error en intento de reconexión: ${error.message}`);
    }
  }, backoffTime);
};

/**
 * Gets the current connection status for health checks
 */
const getConnectionStatus = () => {
  return {
    status: isConnected ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState,
    name: mongoose.connection.name || 'raffle'
  };
};

module.exports = {
  connectDB,
  getConnectionStatus
};
