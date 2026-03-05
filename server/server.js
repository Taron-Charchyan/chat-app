require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const socketIO = require('socket.io');

const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);

// CORS configuration for Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: 'Connected (if no error above)',
  });
});

// Socket handler
socketHandler(io);

// Error handling middleware
app.use(errorHandler);

// Seed default rooms on startup
const seedRooms = async () => {
  try {
    const defaultRooms = [
      { name: 'General', description: 'General discussion for everyone' },
      { name: 'Random', description: 'Random topics and fun' },
      { name: 'Dev Talk', description: 'Programming and tech discussions' },
    ];

    for (const roomData of defaultRooms) {
      const roomExists = await Room.findOne({ name: roomData.name });
      if (!roomExists) {
        await Room.create({
          ...roomData,
          isPrivate: false,
        });
        console.log(`Room "${roomData.name}" created`);
      }
    }
  } catch (error) {
    console.error('Error seeding rooms:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io listening for connections`);
  await seedRooms();
});

module.exports = app;
