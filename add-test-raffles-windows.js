// Script to add test raffle data to MongoDB
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const { Schema } = mongoose;

// MongoDB Connection URI - using the one from .env or hardcoding if needed
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority";

console.log('Connecting to MongoDB...');
console.log('Using MongoDB URI:', MONGO_URI);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
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

// Sample raffle data (using version3 style)
const sampleRaffles = [
  {
    title: "Gran Sorteo Toyota Hilux",
    description: "¡Participa y gana una camioneta Toyota Hilux 2025!",
    prize: "Toyota Hilux 2025",
    ticketPrice: 10.00,
    drawDate: new Date(2025, 8, 15), // September 15, 2025
    status: "active",
    image: "/images/toyota-hilux-raffle.png",
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
    title: "TV Samsung 65 Pulgadas",
    description: "Gana un TV Samsung Smart TV de 65 pulgadas",
    prize: "Samsung Smart TV 65\"",
    ticketPrice: 2.00,
    drawDate: new Date(2025, 6, 20), // July 20, 2025
    status: "active",
    image: "/images/logo-loteria-tachira.png",
    maxTickets: 300,
    percentageSold: 85
  }
];

// Function to add raffles to database
const addRaffles = async () => {
  try {
    // First, clear existing raffles to avoid duplicates
    await Raffle.deleteMany({});
    console.log('Cleared existing raffles');
    
    // Insert new raffle data
    const result = await Raffle.insertMany(sampleRaffles);
    console.log(`Added ${result.length} raffles to database`);
    
    // Display the added raffles
    console.log('Added the following raffles:');
    result.forEach(raffle => console.log(`- ${raffle.title} (${raffle._id})`));
    
    mongoose.disconnect();
    console.log('Done! You can now view the raffles in the frontend.');
  } catch (error) {
    console.error('Error adding raffles:', error);
    mongoose.disconnect();
  }
};

// Run the function
addRaffles();
