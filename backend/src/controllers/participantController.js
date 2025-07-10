const asyncHandler = require('express-async-handler');
const Participant = require('../models/Participant');
const Transaction = require('../models/Transaction');
const Ticket = require('../models/Ticket');

/**
 * Get all participants
 * @route GET /api/participants
 * @access Private (admin only)
 */
const getAllParticipants = asyncHandler(async (req, res) => {
  const participants = await Participant.find({}).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: participants.length,
    data: participants
  });
});

/**
 * Get a participant by ID
 * @route GET /api/participants/:id
 * @access Private (admin only)
 */
const getParticipantById = asyncHandler(async (req, res) => {
  const participant = await Participant.findById(req.params.id)
    .populate({
      path: 'participations',
      populate: { path: 'raffle' }
    })
    .populate('tickets');
  
  if (!participant) {
    res.status(404);
    throw new Error('Participante no encontrado');
  }
  
  res.json({
    success: true,
    data: participant
  });
});

/**
 * Get a participant by email
 * @route GET /api/participants/email/:email
 * @access Public (for ticket verification)
 */
const getParticipantByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  
  const participant = await Participant.findOne({ email: email.toLowerCase() });
  
  if (!participant) {
    res.status(404);
    throw new Error('No se encontró ningún participante con ese correo electrónico');
  }
  
  // Return basic info, not full participant data
  res.json({
    success: true,
    data: {
      id: participant._id,
      fullName: participant.fullName,
      email: participant.email,
      ticketsCount: participant.tickets.length,
      participationsCount: participant.participations.length
    }
  });
});

module.exports = {
  getAllParticipants,
  getParticipantById,
  getParticipantByEmail
};
