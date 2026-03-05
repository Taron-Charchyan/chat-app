const express = require('express');
const {
  getRooms,
  createRoom,
  getRoomById,
  getDMRoom,
  getDMRooms,
} = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getRooms);
router.post('/', authMiddleware, createRoom);
router.get('/dm/list', authMiddleware, getDMRooms);
router.post('/dm/create', authMiddleware, getDMRoom);
router.get('/:id', getRoomById);

module.exports = router;
