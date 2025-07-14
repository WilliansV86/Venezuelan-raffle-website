// Script to add test raffle data to MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Create Raffle Schema (matching your existing schema)
const RaffleSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  prize: { type: String, required: true },
  ticketPrice: { type: Number, required: true },
  drawDate: { type: Date, required: true },
  status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
  image: { type: String },
  maxTickets: { type: Number, default: 100 },
  percentageSold: { type: Number, default: 0 },
  winner: { type: String }
}, { timestamps: true });

// Create Raffle model
const Raffle = mongoose.model('Raffle', RaffleSchema);

// Sample raffle data
const sampleRaffles = [
  {
    title: "Gran Sorteo Toyota Hilux",
    description: "¡Participa y gana una camioneta Toyota Hilux 2025!",
    prize: "Toyota Hilux 2025",
    ticketPrice: 10.00,
    drawDate: new Date(2025, 8, 15), // September 15, 2025
    status: "active",
    image: "/images/logo-loteria-tachira.png",
    maxTickets: 1000,
    percentageSold: 35
  },
  {
    title: "Moto Bera Socialista",
    description: "¡Sorteo especial de una moto Bera Socialista 2025!",
    prize: "Bera Socialista 2025",
    ticketPrice: 5.00,
    drawDate: new Date(2025, 7, 30), // August 30, 2025
    status: "active", 
    image: "/images/logo-loteria-tachira.png",
    maxTickets: 500,
    percentageSold: 65
  },
  {
    title: "Sorteo Efectivo",
    description: "¡$1000 en efectivo para el ganador!",
    prize: "$1000 USD",
    ticketPrice: 2.00,
    drawDate: new Date(2025, 5, 15), // June 15, 2025 (past date)
    status: "completed",
    image: "/images/logo-loteria-tachira.png",
    maxTickets: 200,
    percentageSold: 100,
    winner: "Juan Pérez"
  }
];

// Insert the sample raffles
const addRaffles = async () => {
  try {
    // First clear existing raffles
    await Raffle.deleteMany({});
    console.log('Existing raffles cleared');
    
    // Add new sample raffles
    const result = await Raffle.insertMany(sampleRaffles);
    console.log(`${result.length} raffles added successfully!`);
    console.log(result);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error adding raffles:', err);
    mongoose.connection.close();
  }
};

addRaffles();
