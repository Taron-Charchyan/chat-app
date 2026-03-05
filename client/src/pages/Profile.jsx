import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/chatStore';
import { updateProfile, uploadAvatar } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useStore();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const [selectedFile, setSelectedFile] = useState(null);

  // Profile form state
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <p className="text-dark-text-secondary">Loading...</p>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid image type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      toast.error('No image selected');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await uploadAvatar(formData);
      updateUser(response.data);
      setSelectedFile(null);
      setAvatarPreview(response.data.avatar);
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await updateProfile({
        username: username !== user.username ? username : undefined,
        bio,
      });
      updateUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await updateProfile({
        currentPassword,
        newPassword,
      });
      updateUser(response.data);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-dark-bg overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-white border-opacity-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/chat')}
            className="text-primary hover:text-primary-hover transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-dark-text">Edit Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Avatar Section */}
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-dark-text font-bold text-lg mb-4">Profile Picture</h2>

          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold border-2 border-primary">
                  {getInitials(user.username)}
                </div>
              )}
              <button
                onClick={handleAvatarClick}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <span className="text-white text-3xl">📷</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {selectedFile && (
              <button
                onClick={handleUploadAvatar}
                disabled={isLoading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition disabled:opacity-50"
              >
                {isLoading ? 'Uploading...' : 'Save Avatar'}
              </button>
            )}
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-dark-text font-bold text-lg mb-4">Profile Information</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-dark-text-secondary text-sm mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-dark-text-secondary text-sm mb-2">
                Bio <span className="text-xs">({bio.length}/160)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                maxLength={160}
                className="w-full px-4 py-2 bg-dark-bg border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none h-24"
                placeholder="Tell us about yourself (optional)"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || (username === user.username && bio === user.bio)}
              className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-dark-text font-bold text-lg mb-4">Change Password</h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-dark-text-secondary text-sm mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-dark-text-secondary text-sm mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-dark-text-secondary text-sm mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-dark-text font-bold text-lg mb-4">Account Information</h2>

          <div className="space-y-3">
            <div>
              <p className="text-dark-text-secondary text-sm">Email</p>
              <p className="text-dark-text">{user.email}</p>
            </div>
            <div>
              <p className="text-dark-text-secondary text-sm">Member Since</p>
              <p className="text-dark-text">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
