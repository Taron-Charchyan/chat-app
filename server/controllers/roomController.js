const Room = require('../models/Room');
const User = require('../models/User');

// Get all public rooms
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar');

    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

// Create a new room
exports.createRoom = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a room name' });
    }

    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ message: 'Room already exists' });
    }

    const room = await Room.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id],
      isPrivate: false,
    });

    await room.populate('createdBy', 'username avatar');
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

// Get room by ID
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
};

// Get all DM rooms for the current user
exports.getDMRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      isPrivate: true,
      members: req.user.id,
    })
      .populate('members', 'username avatar isOnline lastSeen email')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

// Get or create DM room
exports.getDMRoom = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Please provide target user ID' });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: 'Cannot DM yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Look for existing DM room between these two users
    let room = await Room.findOne({
      isPrivate: true,
      members: { $all: [req.user.id, targetUserId] },
    })
      .populate('members', 'username avatar isOnline lastSeen')
      .populate('createdBy', 'username avatar');

    if (!room) {
      // Create new DM room
      const timestamp = Date.now();
      room = await Room.create({
        name: `DM-${req.user.id}-${targetUserId}-${timestamp}`,
        isPrivate: true,
        members: [req.user.id, targetUserId],
        createdBy: req.user.id,
      });

      await room.populate('members', 'username avatar isOnline lastSeen');
      await room.populate('createdBy', 'username avatar');
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
};
