const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true
    },
    raffle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Raffle',
      required: true
    },
    paymentAmount: {
      type: Number,
      required: [true, 'El monto del pago es requerido']
    },
    paymentMethod: {
      type: String,
      required: [true, 'El método de pago es requerido'],
      enum: ['pago-movil', 'zelle', 'binance'],
    },
    paymentReference: {
      type: String,
      required: [true, 'La referencia de pago es requerida']
    },
    paymentProof: {
      type: String,  // URL to uploaded payment proof image
      required: [true, 'El comprobante de pago es requerido']
    },
    ticketCount: {
      type: Number,
      required: true
    },
    ticketPrice: {
      type: Number,
      required: true
    },
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
      }
    ],
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending'
    },
    emailScheduledFor: {
      type: Date,
      default: function() {
        // Schedule email for 24 hours after transaction
        const date = new Date();
        date.setHours(date.getHours() + 24);
        return date;
      }
    },
    emailSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
