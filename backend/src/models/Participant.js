const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'El nombre completo es requerido'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es requerido'],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Ingrese un correo electrónico válido']
    },
    whatsappNumber: {
      type: String,
      required: [true, 'El número de WhatsApp es requerido'],
      trim: true
    },
    identificationNumber: {
      type: String,
      trim: true,
      required: [true, 'La cédula de identidad es requerida']
    },
    participations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
      }
    ],
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
      }
    ],
    emailConfirmationSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
