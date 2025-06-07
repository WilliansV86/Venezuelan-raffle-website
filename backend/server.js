require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Basic Route
app.get('/', (req, res) => {
  res.send('API para el Sorteo Venezolano está funcionando! 🇻🇪');
});

// API Routes
app.use('/api/raffles', require('./routes/raffleRoutes'));
app.use('/api/participants', require('./routes/participantRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes')); // Added ticket routes
app.use('/api/payments', require('./routes/paymentRoutes'));

// Error Handling Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
// IMPORTANT: notFound must be placed before other API routes if you want it to catch undefined routes.
// However, typically it's placed AFTER all other app.use() and route calls.
// For now, placing it at the end to catch errors from defined routes or unhandled ones.

// ... (existing API routes) ...

app.use(notFound); // Handles 404 errors for routes not found
app.use(errorHandler); // Handles all other errors

const PORT = process.env.PORT || 5000;
let server;

// Function to start the server
const startServer = () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`ERROR: Puerto ${PORT} ya está en uso. Intente usar otro puerto o libere el puerto actual.`);
    } else {
      console.error(`Error al iniciar el servidor: ${error.message}`);
    }
    process.exit(1); // Exit if server fails to start
  }
};

// Connect to Database and then start server
connectDB()
  .then((conn) => {
    if (conn) {
      // If connection is successful, start the server
      startServer();
    } else {
      // If connectDB returns null (or any falsy value indicating failure)
      console.error('No se pudo conectar a la base de datos. El servidor no se iniciará.');
      process.exit(1); // Exit the process
    }
  })
  .catch((err) => {
    // This catch is for unexpected errors during the connectDB() execution itself
    console.error('Error inesperado durante la conexión a la base de datos:', err);
    process.exit(1); // Exit the process
  });


function gracefulShutdown() {
  console.log('Recibida señal de terminación, cerrando el servidor...');
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado exitosamente');
      // Disconnect from MongoDB
      mongoose.connection.close(false, () => {
        console.log('Conexión MongoDB cerrada');
        process.exit(0);
      });
    });

    // If server hasn't closed in 10 seconds, force shutdown
    setTimeout(() => {
      console.error('No se pudo cerrar el servidor limpiamente, forzando salida');
      process.exit(1);
    }, 10000);
  } else {
    // If server is not even defined, just try to close mongoose connection and exit
    mongoose.connection.close(false, () => {
      console.log('Conexión MongoDB cerrada');
      process.exit(0);
    });
  }
}
