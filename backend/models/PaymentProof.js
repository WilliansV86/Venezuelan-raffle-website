const mongoose = require('mongoose');

const paymentProofSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'La referencia al boleto es obligatoria.'],
    // unique: true, // Each payment proof should ideally be for one ticket purchase instance
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: [true, 'La referencia al participante es obligatoria.'],
  },
  paymentMethod: {
    type: String,
    required: [true, 'El método de pago es obligatorio.'],
    enum: ['Transferencia', 'Pago Móvil', 'Zelle', 'Otro'], // Add more as needed
  },
  referenceNumber: {
    type: String,
    trim: true,
    // Required depending on payment method, can be handled in application logic
  },
  imageUrl: {
    type: String,
    required: [true, 'La URL de la imagen del comprobante es obligatoria.'],
  },
  cloudinaryId: {
    type: String, // To store the public ID from Cloudinary for deletion purposes
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending', // Status of the proof itself, distinct from ticket's paymentStatus
  },
  adminNotes: { // Optional notes from admin during verification
    type: String,
    trim: true,
  }
});

paymentProofSchema.index({ ticket: 1 });
paymentProofSchema.index({ participant: 1 });
paymentProofSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('PaymentProof', paymentProofSchema);
