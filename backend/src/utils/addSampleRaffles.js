/**
 * Add Sample Raffles Script
 * 
 * This script adds sample active and completed raffles to the database
 * for testing purposes.
 * 
 * Run with: node src/utils/addSampleRaffles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

// Create a simple Raffle schema
const raffleSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  status: String,
  drawDate: Date,
  image: String,
  ticketsSold: Number,
  maxTickets: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Raffle model (or use existing if available)
const Raffle = mongoose.models.Raffle || mongoose.model('Raffle', raffleSchema);

// Sample raffle data
const sampleRaffles = [
  {
    title: "Gran Sorteo Mensual",
    description: "¡Participa en nuestro gran sorteo mensual con premios increíbles! Este mes sorteamos una laptop de última generación.",
    price: 5.00,
    status: "active",
    drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    image: "https://res.cloudinary.com/dnxelz82j/image/upload/v1689789456/raffle_default_image.jpg",
    ticketsSold: 120,
    maxTickets: 500
  },
  {
    title: "Sorteo Express Semanal",
    description: "Sorteo rápido con premios en efectivo. ¡Compra tu ticket ahora para participar esta semana!",
    price: 2.50,
    status: "active",
    drawDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    image: "https://res.cloudinary.com/dnxelz82j/image/upload/v1689789456/raffle_default_image.jpg",
    ticketsSold: 45,
    maxTickets: 100
  },
  {
    title: "Sorteo Especial de Navidad",
    description: "¡Nuestro sorteo especial de navidad con grandes premios para celebrar! Participaste con el ticket #123.",
    price: 10.00,
    status: "completed",
    drawDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    image: "https://res.cloudinary.com/dnxelz82j/image/upload/v1689789456/raffle_default_image.jpg",
    ticketsSold: 500,
    maxTickets: 500
  },
  {
    title: "Sorteo de Aniversario",
    description: "Celebramos nuestro aniversario con este sorteo especial. ¡El ganador recibió un premio exclusivo!",
    price: 7.50,
    status: "completed",
    drawDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    image: "https://res.cloudinary.com/dnxelz82j/image/upload/v1689789456/raffle_default_image.jpg",
    ticketsSold: 350,
    maxTickets: 400
  }
];

// Function to add sample raffles
const addSampleRaffles = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.log('Failed to connect to MongoDB. Exiting.');
      process.exit(1);
    }

    console.log('Checking for existing raffles...');
    const existingCount = await Raffle.countDocuments();
    console.log(`Found ${existingCount} existing raffles in the database`);

    if (existingCount > 0) {
      // Ask for confirmation to add more sample data
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('There are already raffles in the database. Add sample raffles anyway? (y/n) ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          await insertRaffles();
        } else {
          console.log('Operation cancelled by user.');
        }
        readline.close();
        await mongoose.connection.close();
        process.exit(0);
      });
    } else {
      await insertRaffles();
      await mongoose.connection.close();
      process.exit(0);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Function to insert the sample raffles
const insertRaffles = async () => {
  try {
    console.log('Adding sample raffles to database...');
    const result = await Raffle.insertMany(sampleRaffles);
    
    console.log(`✅ Successfully added ${result.length} sample raffles to the database:`);
    
    // Group by status and print summary
    const active = result.filter(r => r.status === 'active').length;
    const completed = result.filter(r => r.status === 'completed').length;
    
    console.log(`- Active raffles: ${active}`);
    console.log(`- Completed raffles: ${completed}`);
    
    return result;
  } catch (error) {
    console.error(`Failed to add sample raffles: ${error.message}`);
    throw error;
  }
};

// Run the script
if (require.main === module) {
  addSampleRaffles();
}

module.exports = { addSampleRaffles };
