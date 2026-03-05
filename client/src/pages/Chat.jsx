import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import OnlineUsers from '../components/OnlineUsers';
import { useStore } from '../store/chatStore';
import { useSocket } from '../context/SocketContext';

export default function Chat() {
  const navigate = useNavigate();
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const {
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    setTyping,
    clearTyping,
  } = useStore();
  const socket = useSocket();

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('user:online', (data) => {
      if (data.userId !== user?.id) {
        addOnlineUser(data.userId);
      }
    });

    socket.on('user:offline', (data) => {
      removeOnlineUser(data.userId);
    });

    socket.on('typing:start', (data) => {
      setTyping(data.roomId, data.userId, data.username);
    });

    socket.on('typing:stop', (data) => {
      clearTyping(data.roomId, data.userId);
    });

    return () => {
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [socket, user, addOnlineUser, removeOnlineUser, setTyping, clearTyping]);

  if (!token) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-dark-bg">
      <Sidebar />
      <ChatWindow />
      <OnlineUsers />
    </div>
  );
}
