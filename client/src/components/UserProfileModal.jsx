import { useState, useEffect } from 'react';
import { useStore } from '../store/chatStore';
import { useSocket } from '../context/SocketContext';
import { getUserProfile, getDMRoom } from '../services/api';
import toast from 'react-hot-toast';

export default function UserProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setActiveRoom } = useStore();
  const socket = useSocket();

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await getUserProfile(userId);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusText = (user) => {
    if (user?.isOnline) {
      return 'Online';
    }
    if (user?.lastSeen) {
      const minutes = Math.floor((Date.now() - new Date(user.lastSeen)) / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }
    return 'Offline';
  };

  const handleSendMessage = async () => {
    try {
      const response = await getDMRoom(userId);
      const dmRoom = response.data;
      setActiveRoom(dmRoom);
      if (socket) {
        socket.emit('room:join', dmRoom._id);
      }
      onClose();
    } catch (error) {
      toast.error('Failed to open DM');
    }
  };

  return (
    // <div
    //   className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    //   onClick={onClose}
    // >
    //   <div
    //     className="bg-dark-card rounded-lg w-96 p-6 shadow-xl"
    //     onClick={(e) => e.stopPropagation()}
    //   >
    //     {/* Close button */}
    //     <button
    //       onClick={onClose}
    //       className="absolute top-4 right-4 text-dark-text-secondary hover:text-dark-text transition"
    //     >
    //       ✕
    //     </button>

    //     {isLoading ? (
    //       <div className="flex items-center justify-center h-64">
    //         <p className="text-dark-text-secondary">Loading profile...</p>
    //       </div>
    //     ) : profile ? (
    //       <div className="space-y-4">
    //         {/* Avatar and Status */}
    //         <div className="flex flex-col items-center">
    //           {profile.avatar ? (
    //             <img
    //               src={profile.avatar}
    //               alt={profile.username}
    //               className="w-24 h-24 rounded-full object-cover border-2 border-primary mb-3"
    //             />
    //           ) : (
    //             <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold border-2 border-primary mb-3">
    //               {getInitials(profile.username)}
    //             </div>
    //           )}

    //           <h2 className="text-dark-text font-bold text-lg">{profile.username}</h2>
    //           <p
    //             className={`text-sm ${
    //               profile.isOnline ? 'text-green-400' : 'text-dark-text-secondary'
    //             }`}
    //           >
    //             {getStatusText(profile)}
    //           </p>
    //         </div>

    //         {/* Bio */}
    //         {profile.bio && (
    //           <div>
    //             <p className="text-dark-text-secondary text-sm mb-1">Bio</p>
    //             <p className="text-dark-text text-sm">{profile.bio}</p>
    //           </div>
    //         )}

    //         {/* Member Since */}
    //         <div>
    //           <p className="text-dark-text-secondary text-sm mb-1">Member Since</p>
    //           <p className="text-dark-text text-sm">
    //             {new Date(profile.createdAt).toLocaleDateString()}
    //           </p>
    //         </div>

    //         {/* Send Message Button */}
    //         <button
    //           onClick={handleSendMessage}
    //           className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition mt-4"
    //         >
    //           Send Message
    //         </button>
    //       </div>
    //     ) : (
    //       <div className="text-center py-8">
    //         <p className="text-dark-text-secondary">Failed to load profile</p>
    //       </div>
    //     )}
    //   </div>
    // </div>

<div
  className="fixed inset-0 flex items-center justify-center z-50"
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
  onClick={onClose}
>
  <div
    className="rounded-lg w-96 p-6 shadow-xl relative"
    style={{ backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)' }}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-dark-text-secondary hover:text-dark-text transition"
    >
      ✕
    </button>

    {isLoading ? (
      <div className="flex items-center justify-center h-64">
        <p className="text-dark-text-secondary">Loading profile...</p>
      </div>
    ) : profile ? (
      <div className="space-y-4">
        {/* Avatar and Status */}
        <div className="flex flex-col items-center">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary mb-3"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold border-2 border-primary mb-3">
              {getInitials(profile.username)}
            </div>
          )}

          <h2 className="text-dark-text font-bold text-lg">{profile.username}</h2>
          <p
            className={`text-sm ${
              profile.isOnline ? 'text-green-400' : 'text-dark-text-secondary'
            }`}
          >
            {getStatusText(profile)}
          </p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div>
            <p className="text-dark-text-secondary text-sm mb-1">Bio</p>
            <p className="text-dark-text text-sm">{profile.bio}</p>
          </div>
        )}

        {/* Member Since */}
        <div>
          <p className="text-dark-text-secondary text-sm mb-1">Member Since</p>
          <p className="text-dark-text text-sm">
            {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Send Message Button */}
        <button
          onClick={handleSendMessage}
          className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition mt-4"
        >
          Send Message
        </button>
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-dark-text-secondary">Failed to load profile</p>
      </div>
    )}
  </div>
</div>


  );
}
