require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Will be used by connectDB and gracefulShutdown
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req, res) => {
  res.send('API para el Sorteo Venezolano está funcionando! 🇻🇪');
});

// API Routes
app.use('/api/raffles', require('./routes/raffleRoutes'));
app.use('/api/participants', require('./routes/participantRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Error Handling Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server; // For graceful shutdown

const startServer = () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
    });
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error(`Error al iniciar el servidor: ${error.message}`);
    if (error.code === 'EADDRINUSE') {
      console.error(`ERROR: Puerto ${PORT} ya está en uso.`);
    }
    process.exit(1);
  }
};

connectDB()
  .then((conn) => {
    if (conn) {
      startServer();
    } else {
      console.error('No se pudo conectar a la base de datos (connectDB returned falsy). El servidor no se iniciará.');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Error inesperado durante la conexión a la base de datos (connectDB promise rejected):', err);
    process.exit(1);
  });

function gracefulShutdown() {
  console.log('Recibida señal de terminación, cerrando el servidor...');
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado exitosamente');
      mongoose.connection.close(false, () => {
        console.log('Conexión MongoDB cerrada');
        process.exit(0);
      });
    });
    setTimeout(() => {
      console.error('No se pudo cerrar el servidor limpiamente, forzando salida');
      process.exit(1);
    }, 10000);
  } else {
    mongoose.connection.close(false, () => {
      console.log('Conexión MongoDB cerrada (servidor no estaba definido)');
      process.exit(0);
    });
  }
}
// Triggering nodemon restart to check DB connection

