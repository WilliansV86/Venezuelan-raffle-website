require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to Database - this now returns a promise
connectDB()
  .then((conn) => {
    if (!conn) {
      console.warn('Servidor iniciado sin conexión a la base de datos. Algunas funciones no estarán disponibles.');
    }
  })
  .catch((err) => {
    console.error('Error inesperado al inicializar la conexión a MongoDB:', err);
  });

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

// Start server and store the instance so we can shut it down gracefully
let server;
try {
  server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
  });
} catch (error) {
  if (error.code === 'EADDRINUSE') {
    console.error(`ERROR: Puerto ${PORT} ya está en uso. Intente usar otro puerto o libere el puerto actual.`);
    process.exit(1);
  } else {
    console.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('Recibida señal de terminación, cerrando el servidor...');
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
}
