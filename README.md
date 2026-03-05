# Real-Time Chat App

A modern, real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for instant messaging.

## Features

- **Real-time Messaging**: Instant communication using Socket.io.
- **Dynamic Online Users**: Live list of currently active users.
- **Direct Messaging**: Private conversations between users.
- **Public Rooms**: Create and join themed chat rooms.
- **User Profiles**: Custom avatars, bios, and online status.
- **Rich Media**: Support for file uploads and emoji reactions.
- **Typing Indicators**: See when others are typing in real-time.
- **Premium Design**: Sleek dark-mode interface powered by Tailwind CSS.

## Tech Stack

### Frontend
- React
- Vite
- Zustand (State Management)
- Socket.io Client
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express
- MongoDB (via Mongoose)
- Socket.io
- JSON Web Tokens (JWT)
- Multer (File Handling)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB account (or local installation)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Taron-Charchyan/chat-app.git
   cd chat-app
   ```

2. **Setup Backend**:
   ```bash
   cd server
   npm install
   ```

3. **Setup Frontend**:
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**:
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   SERVER_URL=http://localhost:5000
   ```

5. **Run the Application**:
   In the root directory, you can run:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user data |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/online` | Get currently online users |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile information |
| POST | `/api/users/avatar` | Upload profile avatar |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | Get all public rooms |
| POST | `/api/rooms` | Create a new room |
| GET | `/api/rooms/:id` | Get room by ID |
| GET | `/api/rooms/dm/list` | Get list of DM rooms |
| POST | `/api/rooms/dm/create` | Create/Get a DM room |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:roomId` | Get message history for a room |
| POST | `/api/messages/upload` | Upload a file to a room |

## Project Structure

```text
chat-app/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Socket context
│   │   ├── services/    # API calls
│   │   ├── store/       # Zustand state management
│   │   └── pages/       # Page components
├── server/              # Node.js backend
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth and error middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── socket/          # Socket.io logic
└── README.md
```

## Author

**Taron Charchyan**
- GitHub: [@Taron-Charchyan](https://github.com/Taron-Charchyan)

## License

This project is licensed under the MIT License.
