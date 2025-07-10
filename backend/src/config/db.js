/**
 * Database connection configuration
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('ERROR: No se encontró MONGO_URI en el archivo .env');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    if (error.message.includes('ENOTFOUND')) {
      console.error('ERROR: Verifique que la URL de MongoDB sea correcta.');
    } else if (error.message.includes('Authentication failed')) {
      console.error('ERROR: Falló la autenticación. Verifique el nombre de usuario y contraseña.');
    } else if (error.message.includes('connect ETIMEDOUT')) {
      console.error('ERROR: Tiempo de espera agotado. Su dirección IP podría no estar en la lista blanca en MongoDB Atlas.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
