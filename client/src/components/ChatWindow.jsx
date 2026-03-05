import { useEffect, useRef } from 'react';
import { useStore } from '../store/chatStore';
import { useSocket } from '../context/SocketContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { getMessages } from '../services/api';

export default function ChatWindow() {
  const {
    activeRoom,
    messages,
    addMessage,
    setMessages,
    typingUsers,
    user,
    setSidebarVisible,
  } = useStore();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeRoom) return;

    loadMessages();

    if (socket) {
      socket.on('message:new', (message) => {
        addMessage(message);
      });

      socket.on('message:updated', (message) => {
        setMessages(
          messages.map((m) => (m._id === message._id ? message : m))
        );
      });

      socket.on('room:history', (roomMessages) => {
        setMessages(roomMessages);
      });
    }

    return () => {
      if (socket) {
        socket.off('message:new');
        socket.off('message:updated');
        socket.off('room:history');
      }
    };
  }, [activeRoom, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await getMessages(activeRoom._id, 50);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusText = (otherUser) => {
    if (otherUser?.isOnline) {
      return 'Online';
    }
    if (otherUser?.lastSeen) {
      const minutes = Math.floor((Date.now() - new Date(otherUser.lastSeen)) / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }
    return 'Offline';
  };

  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg">
        <p className="text-dark-text-secondary text-xl text-center px-4">
          👈 Select a room to start chatting
        </p>
      </div>
    );
  }

  const roomTyping = typingUsers[activeRoom._id];
  const otherUser = activeRoom.isPrivate ? activeRoom.members?.find((m) => m._id !== user?.id) : null;

  return (
    <div className="flex-1 flex flex-col bg-dark-bg h-[100dvh] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white border-opacity-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarVisible(true)}
            className="md:hidden text-dark-text p-1 hover:bg-dark-card rounded-lg transition"
            aria-label="Back to sidebar"
          >
            ←
          </button>

          {activeRoom.isPrivate && otherUser ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                {getInitials(otherUser.username)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-dark-text font-bold text-lg truncate">{otherUser.username}</h2>
                <p className="text-dark-text-secondary text-sm truncate">{getStatusText(otherUser)}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h2 className="text-dark-text font-bold text-lg truncate">
                # {activeRoom.name}
              </h2>
              {activeRoom.description && (
                <p className="text-dark-text-secondary text-sm truncate">{activeRoom.description}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-dark-text-secondary mt-8">No messages yet</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender._id === user?.id}
            />
          ))
        )}

        {roomTyping && (
          <div className="flex gap-3 mb-4 items-center">
            <p className="text-dark-text-secondary text-sm">
              {roomTyping.username} is typing
              <span className="ml-1">
                <span className="inline-block animate-bounce">.</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>
                  .
                </span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>
                  .
                </span>
              </span>
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput roomId={activeRoom._id} />
    </div>
  );
}
