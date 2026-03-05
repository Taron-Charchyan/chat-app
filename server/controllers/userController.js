const User = require('../models/User');

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'username avatar bio email isOnline lastSeen');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get online users
exports.getOnlineUsers = async (req, res, next) => {
  try {
    const query = { isOnline: true };
    if (req.user && req.user.id) {
      query._id = { $ne: req.user.id };
    }
    const onlineUsers = await User.find(query, 'username avatar bio email isOnline lastSeen');
    res.json(onlineUsers);
  } catch (error) {
    next(error);
  }
};

// Get public user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username avatar bio isOnline lastSeen createdAt'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, bio, currentPassword, newPassword } = req.body;
    const updates = {};

    // Update username if provided
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updates.username = username;
    }

    // Update bio if provided
    if (bio !== undefined) {
      updates.bio = bio;
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const user = await User.findById(req.user.id).select('+password');
      const isPasswordValid = await user.comparePassword(currentPassword);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      updates.password = newPassword;
    } else if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Upload user avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    next(error);
  }
};
