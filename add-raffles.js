const mongoose = require('mongoose');
const Schema = mongoose.Schema;

console.log('Connecting to MongoDB...');

mongoose.connect('mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');

  // Create Raffle Schema
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

  // Sample raffles
  const sampleRaffles = [
    {
      title: "Gran Sorteo Toyota Hilux",
      description: "¡Participa y gana una camioneta Toyota Hilux 2025!",
      prize: "Toyota Hilux 2025",
      ticketPrice: 10.00,
      drawDate: new Date(2025, 8, 15),
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
      drawDate: new Date(2025, 7, 30),
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
      drawDate: new Date(2025, 6, 20),
      status: "active",
      image: "/images/logo-loteria-tachira.png",
      maxTickets: 300,
      percentageSold: 85
    }
  ];

  // Clear existing raffles and add new ones
  Raffle.deleteMany({})
    .then(() => {
      console.log('Cleared existing raffles');
      return Raffle.insertMany(sampleRaffles);
    })
    .then(result => {
      console.log(`Added ${result.length} raffles to database`);
      result.forEach(raffle => console.log(`- ${raffle.title}`));
      mongoose.disconnect();
      console.log('Done! Raffles added successfully. Disconnected from MongoDB.');
    })
    .catch(err => {
      console.error('Error:', err);
      mongoose.disconnect();
    });
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});
