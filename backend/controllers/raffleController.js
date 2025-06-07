const Raffle = require('../models/Raffle');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all raffles
// @route   GET /api/raffles
// @access  Public
const getAllRaffles = asyncHandler(async (req, res) => {
  // Fetch active raffles, perhaps sorted by end date or creation date
  const raffles = await Raffle.find({ isActive: true }).sort({ endDate: 1 });
  res.json(raffles);
});

// @desc    Create a new raffle
// @route   POST /api/raffles
// @access  Admin (to be implemented)
const createRaffle = asyncHandler(async (req, res) => {
  const { title, description, prize, ticketPrice, totalTickets, endDate, prizeImageUrl } = req.body;

  // --- Enhanced Input Validation for Create ---
  const errors = [];
  if (!title || typeof title !== 'string' || title.trim() === '') errors.push('El título es obligatorio.');
  if (!description || typeof description !== 'string' || description.trim() === '') errors.push('La descripción es obligatoria.');
  if (!prize || typeof prize !== 'string' || prize.trim() === '') errors.push('El premio es obligatorio.');
  if (ticketPrice === undefined || typeof ticketPrice !== 'number' || ticketPrice < 0) {
    errors.push('El precio del boleto debe ser un número no negativo.');
  }
  if (totalTickets === undefined || typeof totalTickets !== 'number' || totalTickets <= 0 || !Number.isInteger(totalTickets)) {
    errors.push('El número total de boletos debe ser un entero positivo.');
  }
  if (!endDate) {
    errors.push('La fecha de finalización es obligatoria.');
  } else {
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      errors.push('La fecha de finalización no es válida.');
    } else if (parsedEndDate <= new Date()) {
      errors.push('La fecha de finalización debe ser en el futuro.');
    }
  }
  if (prizeImageUrl !== undefined && (typeof prizeImageUrl !== 'string' || prizeImageUrl.trim() === '')) {
    // Basic check, for a real URL validation a library or regex would be better
    errors.push('La URL de la imagen del premio debe ser una cadena de texto válida si se proporciona.');
  }

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(' '));
  }

  const raffle = new Raffle({
    title,
    description,
    prize,
    ticketPrice,
    totalTickets,
    endDate,
    prizeImageUrl: prizeImageUrl ? prizeImageUrl.trim() : undefined,
  });

  const createdRaffle = await raffle.save();
  res.status(201).json(createdRaffle);
});

// @desc    Get single raffle by ID
// @route   GET /api/raffles/:id
// @access  Public
const getRaffleById = asyncHandler(async (req, res) => {
  const raffle = await Raffle.findById(req.params.id);

  if (raffle) {
    res.json(raffle);
  } else {
    res.status(404);
    throw new Error('Rifa no encontrada');
  }
});

// @desc    Update a raffle
// @route   PUT /api/raffles/:id
// @access  Admin
const updateRaffle = asyncHandler(async (req, res) => {
  const raffle = await Raffle.findById(req.params.id);

  if (!raffle) {
    res.status(404);
    throw new Error('Rifa no encontrada');
  }

  // For now, allow updating most fields. Consider which fields are immutable.
  // Exclude availableTickets from direct update via this route.
  const { title, description, prize, ticketPrice, totalTickets, endDate, isActive, winner, winningTicketNumber, prizeImageUrl } = req.body;

  // --- Enhanced Input Validation for Update ---
  const updateErrors = [];
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) updateErrors.push('El título no puede estar vacío.');
  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) updateErrors.push('La descripción no puede estar vacía.');
  if (prize !== undefined && (typeof prize !== 'string' || prize.trim() === '')) updateErrors.push('El premio no puede estar vacío.');
  if (ticketPrice !== undefined && (typeof ticketPrice !== 'number' || ticketPrice < 0)) {
    updateErrors.push('El precio del boleto debe ser un número no negativo.');
  }
  if (totalTickets !== undefined) {
    if (typeof totalTickets !== 'number' || totalTickets <= 0 || !Number.isInteger(totalTickets)) {
      updateErrors.push('El número total de boletos debe ser un entero positivo.');
    }
    // More complex validation: Ensure totalTickets is not reduced below the number of tickets sold.
    // This would require fetching sold ticket count for this raffle.
    // For example: if (totalTickets < (raffle.totalTickets - raffle.availableTickets.length)) {
    //   updateErrors.push('El número total de boletos no puede ser menor que la cantidad de boletos ya vendidos.');
    // }
  }
  if (endDate !== undefined) {
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      updateErrors.push('La fecha de finalización no es válida.');
    } else if (parsedEndDate <= (raffle.startDate || new Date())) { // Compare with existing startDate or now
      updateErrors.push('La fecha de finalización debe ser posterior a la fecha de inicio y en el futuro.');
    }
  }
  if (winningTicketNumber !== undefined && winningTicketNumber !== null) {
    if (typeof winningTicketNumber !== 'number' || !Number.isInteger(winningTicketNumber) || winningTicketNumber <= 0) {
        updateErrors.push('El número de boleto ganador debe ser un entero positivo.');
    } else if (raffle.totalTickets && winningTicketNumber > raffle.totalTickets) {
        updateErrors.push(`El número de boleto ganador no puede ser mayor que el total de boletos (${raffle.totalTickets}).`);
    }
  }
  if (prizeImageUrl !== undefined && (typeof prizeImageUrl !== 'string' || prizeImageUrl.trim() === '')) {
    // Basic check for non-empty string if provided. Allows unsetting by providing empty string.
    // For actual URL validation, a more robust method is needed.
    // If prizeImageUrl is explicitly null, it might be intended to remove it.
     if (prizeImageUrl.trim() === '' && prizeImageUrl !== null) { // only error if it's an empty string but not null
        updateErrors.push('La URL de la imagen del premio no puede ser una cadena vacía si se actualiza. Envíe null para eliminarla.');
     } else if (typeof prizeImageUrl !== 'string' && prizeImageUrl !== null) {
        updateErrors.push('La URL de la imagen del premio debe ser una cadena de texto o null.');
     }
  }


  if (updateErrors.length > 0) {
    res.status(400);
    throw new Error(updateErrors.join(' '));
  }

  // Apply updates
  raffle.title = title !== undefined ? title.trim() : raffle.title;
  raffle.description = description !== undefined ? description.trim() : raffle.description;
  raffle.prize = prize !== undefined ? prize.trim() : raffle.prize;
  raffle.ticketPrice = ticketPrice !== undefined ? ticketPrice : raffle.ticketPrice;
  raffle.totalTickets = totalTickets !== undefined ? totalTickets : raffle.totalTickets;
  raffle.endDate = endDate !== undefined ? new Date(endDate) : raffle.endDate;
  raffle.isActive = isActive !== undefined ? isActive : raffle.isActive;
  raffle.winner = winner !== undefined ? winner : raffle.winner; // Assumes winner is just an ID, further validation might be needed if it's an object
  raffle.winningTicketNumber = winningTicketNumber !== undefined ? winningTicketNumber : raffle.winningTicketNumber;
  raffle.prizeImageUrl = prizeImageUrl !== undefined ? (prizeImageUrl === null ? null : prizeImageUrl.trim()) : raffle.prizeImageUrl;


  // If totalTickets is changed, and it's greater than before,
  // we might need to adjust availableTickets.
  // However, if it's reduced, we need to ensure it doesn't go below sold tickets.
  // This logic can be complex. For now, the pre-save hook in Raffle.js only populates
  // availableTickets on creation. Manual adjustment or a more sophisticated update
  // mechanism would be needed if totalTickets changes significantly post-creation.

  const updatedRaffle = await raffle.save(); // .save() will run schema validators
  res.json(updatedRaffle);
});

// @desc    Delete a raffle
// @route   DELETE /api/raffles/:id
// @access  Admin
const deleteRaffle = asyncHandler(async (req, res) => {
  const raffle = await Raffle.findById(req.params.id);

  if (!raffle) {
    res.status(404);
    throw new Error('Rifa no encontrada');
  }

  // TODO: Consider what to do with associated Tickets.
  // For now, just deleting the raffle. A pre-remove hook in the Raffle model
  // could handle cascading deletes or disassociation of tickets.
  await raffle.deleteOne(); // Changed from .remove() which is deprecated for instances

  res.json({ message: 'Rifa eliminada exitosamente' });
});

module.exports = {
  getAllRaffles,
  createRaffle,
  getRaffleById,
  updateRaffle,
  deleteRaffle,
};
