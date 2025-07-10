const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio.'],
    trim: true,
  },
  cedula: {
    type: String,
    required: [true, 'El número de cédula es obligatorio.'],
    trim: true,
    // Basic validation for Venezuelan cedula (V- or E- followed by digits)
    match: [/^[VE]-\d+$/, 'Por favor, introduce un número de cédula válido (ej: V-12345678).'],
  },
  whatsapp: {
    type: String,
    required: [true, 'El número de WhatsApp es obligatorio.'],
    trim: true,
    // Basic validation for Venezuelan WhatsApp numbers (+58 followed by 10 digits)
    // More robust validation can be added as needed
    match: [/^\+58\d{10}$/, 'Por favor, introduce un número de WhatsApp venezolano válido (ej: +584121234567).'],
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio.'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, introduce un correo electrónico válido.'],
    // Consider adding unique: true if emails should be unique across all participants
    // unique: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Add index for fields that will be frequently queried
participantSchema.index({ email: 1 });
participantSchema.index({ whatsapp: 1 });

module.exports = mongoose.model('Participant', participantSchema);
