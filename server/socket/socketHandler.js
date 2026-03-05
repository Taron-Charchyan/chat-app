const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    try {
      // Set user online
      const user = await User.findByIdAndUpdate(
        socket.userId,
        {
          isOnline: true,
          lastSeen: new Date(),
        },
        { new: true }
      );

      console.log(`User ${socket.userId} connected`);

      // Emit user online event
      io.emit('user:online', {
        userId: socket.userId,
        username: user.username,
        avatar: user.avatar,
      });

      // room:join
      socket.on('room:join', async (roomId) => {
        try {
          socket.join(roomId);

          // Get room history
          const messages = await Message.find({ room: roomId })
            .populate('sender', 'username avatar email')
            .sort({ createdAt: 1 })
            .limit(50);

          socket.emit('room:history', messages);
          socket.to(roomId).emit('user:joined', { userId: socket.userId });
        } catch (error) {
          console.error('Error in room:join:', error);
        }
      });

      // room:leave
      socket.on('room:leave', (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user:left', { userId: socket.userId });
      });

      // message:send
      socket.on('message:send', async (data) => {
        try {
          const { roomId, content, type, fileUrl, fileName, fileSize } = data;

          const message = await Message.create({
            room: roomId,
            sender: socket.userId,
            content,
            type,
            fileUrl,
            fileName,
            fileSize,
          });

          // Update room's updatedAt for DM sorting
          await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });

          const populatedMessage = await Message.findById(message._id).populate(
            'sender',
            'username avatar email'
          );

          io.to(roomId).emit('message:new', populatedMessage);
        } catch (error) {
          console.error('Error in message:send:', error);
        }
      });

      // message:react
      socket.on('message:react', async (data) => {
        try {
          const { messageId, emoji, roomId } = data;

          let message = await Message.findById(messageId);

          const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

          if (reactionIndex !== -1) {
            const userIndex = message.reactions[reactionIndex].users.indexOf(socket.userId);

            if (userIndex !== -1) {
              message.reactions[reactionIndex].users.splice(userIndex, 1);

              if (message.reactions[reactionIndex].users.length === 0) {
                message.reactions.splice(reactionIndex, 1);
              }
            } else {
              message.reactions[reactionIndex].users.push(socket.userId);
            }
          } else {
            message.reactions.push({
              emoji,
              users: [socket.userId],
            });
          }

          await message.save();

          const updatedMessage = await Message.findById(messageId).populate(
            'sender',
            'username avatar email'
          );

          io.to(roomId).emit('message:updated', updatedMessage);
        } catch (error) {
          console.error('Error in message:react:', error);
        }
      });

      // typing:start
      socket.on('typing:start', async (roomId) => {
        try {
          const user = await User.findById(socket.userId);
          socket.to(roomId).emit('typing:start', {
            userId: socket.userId,
            username: user.username,
          });
        } catch (error) {
          console.error('Error in typing:start:', error);
        }
      });

      // typing:stop
      socket.on('typing:stop', (roomId) => {
        socket.to(roomId).emit('typing:stop', { userId: socket.userId });
      });

      // disconnect
      socket.on('disconnect', async () => {
        try {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          console.log(`User ${socket.userId} disconnected`);
          io.emit('user:offline', { userId: socket.userId });

          // Remove from typing indicators (client-side filters or handle here)
          // Simple way: emit typing:stop to all rooms user was in,
          // but Socket.io disconnect already makes them broadcat from all rooms.
          // However, we want to be explicit if needed.
        } catch (error) {
          console.error('Error in disconnect:', error);
        }
      });
    } catch (error) {
      console.error('Connection error:', error);
    }
  });
};

module.exports = socketHandler;
