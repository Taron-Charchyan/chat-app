import { useEffect, useState } from 'react';
import { useStore } from '../store/chatStore';
import { useSocket } from '../context/SocketContext';
import { getOnlineUsers } from '../services/api';
import UserProfileModal from './UserProfileModal';

export default function OnlineUsers() {
  const { user, onlineUsers, setOnlineUsers, addOnlineUser, removeOnlineUser } = useStore();
  const socket = useSocket();
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    loadOnlineUsers();

    if (socket) {
      socket.on('user:online', (data) => {
        if (data.userId !== user?.id) {
          addOnlineUser({
            _id: data.userId,
            username: data.username,
            avatar: data.avatar,
          });
        }
      });

      socket.on('user:offline', (data) => {
        removeOnlineUser(data.userId);
      });
    }

    return () => {
      if (socket) {
        socket.off('user:online');
        socket.off('user:offline');
      }
    };
  }, [socket, user?.id]);

  const loadOnlineUsers = async () => {
    try {
      const response = await getOnlineUsers();
      setOnlineUsers(response.data);
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  return (
    <>
      <div className="w-64 bg-dark-sidebar border-l border-white border-opacity-10 flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-white border-opacity-10">
          <h2 className="text-dark-text font-bold">
            🟢 Online ({onlineUsers.length})
          </h2>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {onlineUsers.length === 0 ? (
            <p className="text-dark-text-secondary text-center text-sm py-8">
              No users online
            </p>
          ) : (
            onlineUsers.map((onlineUser) => (
              <div
                key={onlineUser._id}
                onClick={() => setSelectedUserId(onlineUser._id)}
                className="flex items-center gap-2 p-2 hover:bg-dark-card rounded-lg transition cursor-pointer"
              >
                <div className="w-3 h-3 rounded-full bg-online"></div>
                <span className="text-dark-text text-sm truncate">{onlineUser.username}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
}
