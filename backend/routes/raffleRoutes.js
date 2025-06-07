const express = require('express');
const router = express.Router();
const { getAllRaffles, createRaffle, getRaffleById /*, updateRaffle, deleteRaffle */ } = require('../controllers/raffleController');

router.route('/').get(getAllRaffles).post(createRaffle);

router.route('/:id').get(getRaffleById); // .put(updateRaffle).delete(deleteRaffle); // We'll add put and delete later

module.exports = router;
