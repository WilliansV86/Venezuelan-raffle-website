// Temporary debugging: Add a global error catcher to find the crash source
process.on('uncaughtException', (err, origin) => {
  console.error('----------------------------------------');
  console.error('FATAL: An uncaught exception occurred!');
  console.error('----------------------------------------');
  console.error('Error:', err);
  console.error('Origin:', origin);
  console.error('Stack Trace:', err.stack);
  process.exit(1); // Exit with failure code
});

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db.js');
const healthCheckRoutes = require('./src/routes/healthCheck.js');
const raffleRoutes = require('./src/routes/raffleRoutes.js');
const adminRoutes = require('./src/routes/adminRoutes.js');


const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

connectDB().then(() => {
    console.log('Database connection successful, starting web server...');
    const app = express();
    app.use(cors());
    app.use(express.json());
    const PORT = 5100;

    app.get('/', (req, res) => {
      res.send('Server with DB connection is running!');
    });

    app.use('/api/health', healthCheckRoutes);
    app.use('/api/raffles', raffleRoutes);
    app.use('/api/admin', adminRoutes);



    app.listen(PORT, () => {
      console.log(`Server with DB connection listening on port ${PORT}`);
    });

}).catch(err => {
    console.error('Failed to connect to the database. Server will not start.', err);
    process.exit(1);
});
