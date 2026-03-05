const Message = require('../models/Message');
const path = require('path');
const fs = require('fs');

// Get messages for a room
exports.getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username avatar email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
};

// Upload file
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    res.json({
      fileUrl,
      fileName,
      fileSize,
    });
  } catch (error) {
    next(error);
  }
};
