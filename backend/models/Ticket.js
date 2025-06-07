const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  raffle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Raffle',
    required: [true, 'La referencia al sorteo es obligatoria.'],
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: [true, 'La referencia al participante es obligatoria.'],
  },
  ticketNumber: {
    type: Number,
    required: [true, 'El número de boleto es obligatorio.'],
    min: [1, 'El número de boleto debe ser al menos 1.'],
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    required: true,
  },
  paymentProof: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentProof',
    // This can be null initially, and linked when proof is uploaded
  },
  // Optional: if you want to store a transaction ID from the payment platform
  // transactionId: {
  //   type: String,
  //   trim: true,
  // }
});

// Ensure a ticket number is unique per raffle
ticketSchema.index({ raffle: 1, ticketNumber: 1 }, { unique: true });

// Index for querying tickets by participant or payment status
ticketSchema.index({ participant: 1 });
ticketSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
