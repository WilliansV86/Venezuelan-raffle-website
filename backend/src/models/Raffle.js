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
  // Fields for progress bar display management
  displayProgressMode: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'automatic'
  },
  displayProgressValue: {
    type: Number,
    min: 0,
    max: 100,
    default: null // null means use automatic calculation
  },
}, {
  timestamps: true,
});

// Virtual property to calculate available tickets
raffleSchema.virtual('ticketsAvailable').get(function() {
  return this.maxTickets - this.ticketsSold;
});

// Ensure virtual fields are included in toJSON and toObject outputs
raffleSchema.set('toJSON', { virtuals: true });
raffleSchema.set('toObject', { virtuals: true });

const Raffle = mongoose.model('Raffle', raffleSchema);

module.exports = Raffle;
