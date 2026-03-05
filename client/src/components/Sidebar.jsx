import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/chatStore';
import { getRooms, createRoom, getDMRoom, getUsers, getDMRooms } from '../services/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout, setRooms, setActiveRoom, setDmRooms, rooms, activeRoom, dmRooms, onlineUsers } = useStore();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    loadRooms();
    loadDMRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadDMRooms = async () => {
    try {
      const response = await getDMRooms();
      setDmRooms(response.data);
    } catch (error) {
      console.error('Error loading DM rooms:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.filter((u) => u._id !== user?.id));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error('Room name is required');
      return;
    }

    setLoading(true);

    try {
      await createRoom(roomName, roomDesc);
      toast.success('Room created successfully');
      setRoomName('');
      setRoomDesc('');
      setShowCreateRoom(false);
      loadRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDM = async (targetUserId) => {
    try {
      const response = await getDMRoom(targetUserId);
      const dmRoom = response.data;
      setActiveRoom(dmRoom);
      setShowNewDM(false);
      await loadDMRooms();
      if (socket) {
        socket.emit('room:join', dmRoom._id);
      }
    } catch (error) {
      toast.error('Failed to start DM');
    }
  };

  const handleRoomClick = (room) => {
    setActiveRoom(room);
    if (socket) {
      socket.emit('room:join', room._id);
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    logout();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="w-80 bg-dark-sidebar border-r border-white border-opacity-10 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white border-opacity-10">
        <h1 className="text-2xl font-bold text-dark-text">💬 Chat</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Public Rooms */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-dark-text font-semibold">Rooms</h2>
            <button
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="text-primary hover:text-primary-hover text-lg"
            >
              +
            </button>
          </div>

          {showCreateRoom && (
            <form onSubmit={handleCreateRoom} className="mb-4 p-3 bg-dark-card rounded-lg">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Room name"
                className="w-full px-3 py-2 bg-dark-bg border border-white border-opacity-10 rounded text-dark-text placeholder-dark-text-secondary mb-2 text-sm"
              />
              <input
                type="text"
                value={roomDesc}
                onChange={(e) => setRoomDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 bg-dark-bg border border-white border-opacity-10 rounded text-dark-text placeholder-dark-text-secondary mb-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white text-sm py-1 rounded transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </form>
          )}

          <div className="space-y-1">
            {rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => handleRoomClick(room)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${activeRoom?._id === room._id
                  ? 'bg-primary text-white'
                  : 'text-dark-text hover:bg-dark-card'
                  }`}
              >
                # {room.name}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div className="p-4 border-t border-white border-opacity-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-dark-text font-semibold">Direct Messages</h2>
            <button
              onClick={() => {
                setShowNewDM(!showNewDM);
                if (!showNewDM) loadUsers();
              }}
              className="text-primary hover:text-primary-hover text-lg"
            >
              +
            </button>
          </div>

          {showNewDM && (
            <div className="mb-4 p-3 bg-dark-card rounded-lg max-h-48 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-dark-text-secondary text-sm text-center py-4">No users available</p>
              ) : (
                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleStartDM(u._id)}
                      className="w-full text-left px-3 py-2 rounded text-dark-text hover:bg-dark-bg text-sm transition flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(u.username)}
                      </div>
                      <span>{u.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            {dmRooms.map((dm) => {
              const otherMember = dm.members?.find((m) => m._id !== user?.id);
              const isUserOnline = onlineUsers.some((u) => u._id === otherMember?._id);

              return (
                <button
                  key={dm._id}
                  onClick={() => handleRoomClick(dm)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${activeRoom?._id === dm._id
                    ? 'bg-primary text-white'
                    : 'text-dark-text hover:bg-dark-card'
                    }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isUserOnline ? 'bg-online' : 'bg-gray-600'
                      }`}
                  ></div>
                  <span className="truncate">{otherMember?.username || 'DM'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white border-opacity-10 space-y-3">
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition"
          >
            {user?.username ? getInitials(user.username) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-dark-text font-medium text-sm truncate">{user?.username}</p>
            <p className="text-dark-text-secondary text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 px-3 py-2 bg-dark-bg hover:bg-dark-card rounded-lg transition text-dark-text text-sm font-medium"
            title="Edit Profile"
          >
            ⚙️ Edit
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-dark-bg hover:bg-dark-card rounded-lg transition text-dark-text-secondary hover:text-dark-text text-sm"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  );
}
