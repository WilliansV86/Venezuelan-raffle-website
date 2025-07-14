const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true },
  owner: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  paid: { type: Boolean, default: false },
  paymentReference: { type: String },
});

const raffleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  priceBS: {
    type: Number,
    required: true,
  },
  maxTickets: {
    type: Number,
    required: true,
  },
  drawDate: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft',
  },
  ticketsSold: {
    type: Number,
    default: 0,
  },
  tickets: [ticketSchema],
}, {
  timestamps: true,
});

const Raffle = mongoose.model('Raffle', raffleSchema);

module.exports = Raffle;
