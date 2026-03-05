import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (email, password) => {
  return api.post('/api/auth/login', { email, password });
};

export const register = (username, email, password) => {
  return api.post('/api/auth/register', { username, email, password });
};

export const getMe = () => {
  return api.get('/api/auth/me');
};

// Room APIs
export const getRooms = () => {
  return api.get('/api/rooms');
};

export const createRoom = (name, description) => {
  return api.post('/api/rooms', { name, description });
};

export const getRoomById = (roomId) => {
  return api.get(`/api/rooms/${roomId}`);
};

export const getDMRoom = (targetUserId) => {
  return api.post('/api/rooms/dm/create', { targetUserId });
};

export const getDMRooms = () => {
  return api.get('/api/rooms/dm/list');
};

// Message APIs
export const getMessages = (roomId, limit = 50) => {
  return api.get(`/api/messages/${roomId}?limit=${limit}`);
};

export const uploadFile = (formData) => {
  return api.post('/api/messages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// User APIs
export const getUsers = () => {
  return api.get('/api/users');
};

export const getOnlineUsers = () => {
  return api.get('/api/users/online');
};

export const getUserProfile = (userId) => {
  return api.get(`/api/users/${userId}`);
};

export const updateProfile = (data) => {
  return api.put('/api/users/profile', data);
};

export const uploadAvatar = (formData) => {
  return api.post('/api/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
