const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del sorteo es requerido'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La descripción del sorteo es requerida']
    },
    imageUrl: {
      type: String,
      required: [true, 'La imagen del sorteo es requerida']
    },
    ticketPrice: {
      type: Number,
      required: [true, 'El precio del ticket es requerido'],
      default: 1.5,
      min: [0.1, 'El precio del ticket debe ser mayor a 0']
    },
    currencyCode: {
      type: String,
      default: 'USD'
    },
    exchangeRate: {
      type: Number,  // Bs per USD
      default: 160
    },
    startDate: {
      type: Date,
      required: [true, 'La fecha de inicio es requerida']
    },
    endDate: {
      type: Date,
      required: [true, 'La fecha de finalización es requerida']
    },
    drawDate: {
      type: Date,
      required: [true, 'La fecha del sorteo es requerida']
    },
    maxTickets: {
      type: Number,
      default: 10000
    },
    minTicketsPerPurchase: {
      type: Object,
      default: {
        'pago-movil': 2,
        'zelle': 10,
        'binance': 10
      }
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft'
    },
    ticketsSold: {
      type: Number,
      default: 0
    },
    prize: {
      type: String,
      required: [true, 'El premio del sorteo es requerido']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for percentage of tickets sold
raffleSchema.virtual('percentageSold').get(function() {
  return (this.ticketsSold / this.maxTickets) * 100;
});

// Virtual for percentage of tickets remaining
raffleSchema.virtual('percentageRemaining').get(function() {
  return 100 - ((this.ticketsSold / this.maxTickets) * 100);
});

// Virtual for tickets remaining count
raffleSchema.virtual('ticketsRemaining').get(function() {
  return this.maxTickets - this.ticketsSold;
});

const Raffle = mongoose.model('Raffle', raffleSchema);

module.exports = Raffle;
