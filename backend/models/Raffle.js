const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título del sorteo es obligatorio.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La descripción del sorteo es obligatoria.'],
    trim: true,
  },
  prize: {
    type: String,
    required: [true, 'La descripción del premio es obligatoria.'],
  },
  ticketPrice: {
    type: Number,
    required: [true, 'El precio del boleto es obligatorio.'],
    min: [0, 'El precio del boleto no puede ser negativo.'],
  },
  totalTickets: {
    type: Number,
    required: [true, 'El número total de boletos es obligatorio.'],
    min: [1, 'Debe haber al menos un boleto.'],
  },
  availableTickets: {
    type: [Number], // Array of available ticket numbers, e.g., [1, 2, 3, ..., 500]
    // This will be populated initially and numbers removed as they are sold
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'La fecha de finalización del sorteo es obligatoria.'],
  },
  isActive: {
    type: Boolean,
    default: true, // Raffles are active by default when created
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant', // Reference to the participant who won
    default: null,
  },
  winningTicketNumber: {
    type: Number,
    default: null,
  },
  // You might want to add an image URL for the prize or raffle banner
  prizeImageUrl: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure endDate is after startDate
raffleSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('La fecha de finalización debe ser posterior a la fecha de inicio.'));
  } else {
    next();
  }
});

// Initialize available tickets when a new raffle is created
raffleSchema.pre('save', function(next) {
  if (this.isNew && this.totalTickets > 0) {
    this.availableTickets = Array.from({ length: this.totalTickets }, (_, i) => i + 1);
  }
  next();
});

raffleSchema.index({ isActive: 1, endDate: 1 });

module.exports = mongoose.model('Raffle', raffleSchema);
