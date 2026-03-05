import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/chatStore';
import UserProfileModal from './UserProfileModal';

export default function MessageBubble({ message, isOwn }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { user } = useStore();
  const navigate = useNavigate();

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (username) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleUserClick = (e) => {
    e.stopPropagation();
    if (message.sender._id === user?.id) {
      navigate('/profile');
    } else {
      setShowUserProfile(true);
    }
  };

  return (
    <>
      <div className={`flex gap-3 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {!isOwn && (
          <div
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0 cursor-pointer hover:opacity-80 transition"
            title={message.sender.username}
            onClick={handleUserClick}
          >
            {getInitials(message.sender.username)}
          </div>
        )}

        <div className={`max-w-xs ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          {!isOwn && (
            <p
              className="text-dark-text-secondary text-sm px-3 mb-1 cursor-pointer hover:text-primary transition"
              onClick={handleUserClick}
            >
              {message.sender.username}
            </p>
          )}

        <div className={`px-4 py-2 rounded-lg ${isOwn ? 'bg-primary' : 'bg-dark-card'}`}>
          {message.type === 'text' && (
            <p className="text-dark-text break-words">{message.content}</p>
          )}

          {message.type === 'image' && (
            <div className="group relative">
              <img
                src={message.fileUrl}
                alt="shared"
                onClick={() => setShowLightbox(true)}
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition"
              />
              <button
                onClick={() => handleDownload(message.fileUrl, message.fileName || 'image')}
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded hover:bg-opacity-80 transition opacity-0 group-hover:opacity-100"
                title="Download image"
              >
                ⬇️
              </button>
            </div>
          )}

          {message.type === 'file' && (
            <div className="group flex items-center gap-3 relative">
              <span className="text-2xl">📎</span>
              <div className="flex flex-col">
                <span className="text-primary break-words max-w-xs">
                  {message.fileName}
                </span>
                <span className="text-xs text-dark-text-secondary mt-1">
                  {formatFileSize(message.fileSize)}
                </span>
              </div>
              <button
                onClick={() => handleDownload(message.fileUrl, message.fileName)}
                className="ml-auto p-2 bg-black bg-opacity-60 text-white rounded hover:bg-opacity-80 transition opacity-0 group-hover:opacity-100"
                title="Download file"
              >
                ⬇️
              </button>
            </div>
          )}
        </div>

        <p className="text-dark-text-secondary text-xs mt-1 px-3">
          {formatTime(message.createdAt)}
        </p>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {message.reactions.map((reaction, idx) => (
              <span
                key={idx}
                className="bg-dark-card px-2 py-1 rounded text-xs cursor-pointer hover:bg-opacity-75"
                title={reaction.users.length}
              >
                {reaction.emoji} {reaction.users.length}
              </span>
            ))}
          </div>
        )}
      </div>

      </div>

      {showLightbox && message.type === 'image' && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-screen" onClick={(e) => e.stopPropagation()}>
            <img
              src={message.fileUrl}
              alt="fullscreen"
              className="max-w-4xl max-h-screen object-contain rounded-lg"
            />
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition text-xl"
              title="Close"
            >
              ✕
            </button>
            <button
              onClick={() => handleDownload(message.fileUrl, message.fileName || 'image')}
              className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition text-xl"
              title="Download"
            >
              ⬇️
            </button>
          </div>
        </div>
      )}

      {showUserProfile && (
        <UserProfileModal
          userId={message.sender._id}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </>
  );
}
