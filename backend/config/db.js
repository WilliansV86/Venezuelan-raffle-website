const mongoose = require('mongoose');

// Cache the connection to avoid multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Set connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Increased timeout to 10 seconds
  socketTimeoutMS: 60000, // Increased socket timeout to 60 seconds
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  minPoolSize: 1, // Minimum number of connections in the connection pool
  maxIdleTimeMS: 30000, // How long a connection can be idle before being removed from the pool
  retryWrites: true,
  w: 'majority',
};

// Set up event listeners for the connection
const setupEventListeners = () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('ℹ️ Mongoose disconnected from MongoDB');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to MongoDB');
  });

  mongoose.connection.on('disconnecting', () => {
    console.log('ℹ️ Mongoose is disconnecting from MongoDB...');
  });

  mongoose.connection.on('reconnectFailed', () => {
    console.error('❌ Mongoose failed to reconnect to MongoDB');
  });
};

// Function to check if the connection is ready
const isConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Function to wait for the connection to be ready
const waitForConnection = async (timeout = 10000) => {
  const start = Date.now();
  while (!isConnected() && Date.now() - start < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return isConnected();
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the .env file');
    }

    // If we have a cached connection that's still connected, return it
    if (cached.conn && isConnected()) {
      console.log('Using existing database connection');
      return cached.conn;
    }

    console.log('Creating new database connection...');
    
    // Create a new connection promise if one doesn't exist or if the existing one failed
    if (!cached.promise) {
      console.log('Creating new connection promise...');
      
      // Set up event listeners for the connection
      setupEventListeners();
      
      // Create the connection promise
      cached.promise = (async () => {
        try {
          const conn = await mongoose.connect(process.env.MONGO_URI, options);
          console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
          return conn;
        } catch (error) {
          console.error('Error in connection promise:', error);
          cached.promise = null; // Clear the promise on error
          throw error;
        }
      })();
    }

    try {
      // Wait for the connection to be established
      console.log('Waiting for connection to be established...');
      cached.conn = await cached.promise;
      
      // Wait for the connection to be ready
      const isReady = await waitForConnection();
      if (!isReady) {
        throw new Error('MongoDB connection is not ready after timeout');
      }
      
      return cached.conn;
    } catch (e) {
      // If there's an error, clear the promise so we can try again
      console.error('Error establishing connection, clearing cache...', e);
      cached.promise = null;
      throw e;
    }
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Handle application termination
process.on('SIGINT', async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Mongoose connection closed through app termination');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Export both connectDB and isConnected
module.exports = {
  connectDB,
  isConnected,
  waitForConnection,
  connection: mongoose.connection
};