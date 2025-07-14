const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  raffle: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Raffle',
  },
  participantInfo: {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    cedula: { type: String, required: true },
    whatsapp: { type: String, required: true },
  },
  tickets: [
    {
      number: { type: String, required: true },
    },
  ],
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentReference: {
    type: String,
  },
  paymentScreenshot: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
