const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    number: {
      type: String, // Changed from Number to support zero-padding
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{4}$/, 'El número de ticket debe tener exactamente 4 dígitos'],
      index: true
    },
    isAssigned: {
      type: Boolean,
      default: false
    },
    raffle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Raffle',
      required: true
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      default: null
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Method to find available tickets
ticketSchema.statics.findAvailable = function(raffleId, count) {
  return this.find({ raffle: raffleId, isAssigned: false }).limit(count);
};

// Method to count remaining available tickets
ticketSchema.statics.countAvailable = function(raffleId) {
  return this.countDocuments({ raffle: raffleId, isAssigned: false });
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
