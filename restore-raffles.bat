@echo off
echo ===============================================
echo VENEZUELAN RAFFLE WEBSITE - RESTORING RAFFLES
echo ===============================================
echo.

REM Kill any existing node processes to free up ports
echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

REM Set up environment
echo Setting up environment...
cd %~dp0\backend

REM Create .env file with proper configuration
echo Creating backend .env file...
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority> .env
echo PORT=5100>> .env
echo ADMIN_KEY=admin123>> .env
echo NODE_ENV=development>> .env

REM Start the backend server
echo Starting backend server...
start cmd /k "cd %~dp0\backend && npm start"

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 8 /nobreak > nul

REM Create a temporary script to add raffles
echo Creating raffle data script...
cd %~dp0
(
echo const mongoose = require('./backend/node_modules/mongoose'^);
echo const Schema = mongoose.Schema;
echo.
echo console.log('Connecting to MongoDB...'^);
echo.
echo mongoose.connect('mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority', {
echo   useNewUrlParser: true,
echo   useUnifiedTopology: true
echo }^)
echo .then(^(^) =^> {
echo   console.log('Connected to MongoDB successfully'^);
echo.  
echo   // Create Raffle Schema
echo   const RaffleSchema = new Schema({
echo     title: { type: String, required: true },
echo     description: { type: String, required: true },
echo     prize: { type: String, required: true },
echo     ticketPrice: { type: Number, required: true },
echo     drawDate: { type: Date, required: true },
echo     status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
echo     image: { type: String },
echo     maxTickets: { type: Number, default: 100 },
echo     percentageSold: { type: Number, default: 0 },
echo     winner: { type: String }
echo   }, { timestamps: true }^);
echo.
echo   // Create Raffle model
echo   const Raffle = mongoose.model('Raffle', RaffleSchema^);
echo.
echo   // Sample raffles
echo   const sampleRaffles = [
echo     {
echo       title: "Gran Sorteo Toyota Hilux",
echo       description: "¡Participa y gana una camioneta Toyota Hilux 2025!",
echo       prize: "Toyota Hilux 2025",
echo       ticketPrice: 10.00,
echo       drawDate: new Date(2025, 8, 15^),
echo       status: "active",
echo       image: "/images/toyota-hilux-raffle.png",
echo       maxTickets: 1000,
echo       percentageSold: 35
echo     },
echo     {
echo       title: "Moto Bera Socialista",
echo       description: "¡Sorteo especial de una moto Bera Socialista 2025!",
echo       prize: "Bera Socialista 2025",
echo       ticketPrice: 5.00,
echo       drawDate: new Date(2025, 7, 30^),
echo       status: "active",
echo       image: "/images/logo-loteria-tachira.png",
echo       maxTickets: 500,
echo       percentageSold: 65
echo     },
echo     {
echo       title: "TV Samsung 65 Pulgadas",
echo       description: "Gana un TV Samsung Smart TV de 65 pulgadas",
echo       prize: "Samsung Smart TV 65\\"",
echo       ticketPrice: 2.00,
echo       drawDate: new Date(2025, 6, 20^),
echo       status: "active",
echo       image: "/images/logo-loteria-tachira.png",
echo       maxTickets: 300,
echo       percentageSold: 85
echo     }
echo   ];
echo.
echo   // Clear existing raffles and add new ones
echo   Raffle.deleteMany({})
echo     .then(^(^) =^> {
echo       console.log('Cleared existing raffles'^);
echo       return Raffle.insertMany(sampleRaffles^);
echo     })
echo     .then(result =^> {
echo       console.log(`Added ${result.length} raffles to database`^);
echo       result.forEach(raffle =^> console.log(`- ${raffle.title}`^)^);
echo       mongoose.disconnect(^);
echo       console.log('Done! Raffles added successfully. Disconnected from MongoDB.'^);
echo     })
echo     .catch(err =^> {
echo       console.error('Error:', err^);
echo       mongoose.disconnect(^);
echo     });
echo })
echo .catch(err =^> {
echo   console.error('MongoDB Connection Error:', err^);
echo   process.exit(1^);
echo });
) > add-raffles-temp.js

REM Run the script to add raffles
echo Adding test raffles to the database...
cd %~dp0
node add-raffles-temp.js

REM Wait for script to complete
timeout /t 5 /nobreak > nul

REM Start the frontend on port 3001
echo Starting frontend on port 3001...
start cmd /k "cd %~dp0\frontend && set PORT=3001 && npm start"

echo.
echo ===============================================
echo VENEZUELAN RAFFLE WEBSITE IS RUNNING!
echo.
echo - Backend: http://localhost:5100
echo - Frontend: http://localhost:3001
echo.
echo If you don't see the raffle cards after the
echo frontend loads, please refresh the page.
echo ===============================================
