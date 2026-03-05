import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('chat_token') || null,
  isAuthLoading: true, // Track if auth is being verified

  // Chat state
  rooms: [],
  dmRooms: [],
  activeRoom: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},
  dmList: [],

  // Actions
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('chat_token', token);
    } else {
      localStorage.removeItem('chat_token');
    }
    set({ token });
  },

  setAuthLoading: (isLoading) => set({ isAuthLoading: isLoading }),

  logout: () => {
    localStorage.removeItem('chat_token');
    set({
      user: null,
      token: null,
      rooms: [],
      dmRooms: [],
      activeRoom: null,
      messages: [],
      onlineUsers: [],
      typingUsers: {},
      dmList: [],
    });
  },

  updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

  setRooms: (rooms) => set({ rooms }),

  setDmRooms: (dmRooms) => set({ dmRooms }),

  addDmRoom: (room) =>
    set((state) => {
      const exists = state.dmRooms.find((r) => r._id === room._id);
      return { dmRooms: exists ? state.dmRooms : [room, ...state.dmRooms] };
    }),

  setActiveRoom: (room) => set({ activeRoom: room, messages: [] }),

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setMessages: (messages) => set({ messages }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (userData) => {
    set((state) => {
      const exists = state.onlineUsers.find((u) => u._id === userData._id);
      if (exists) return { onlineUsers: state.onlineUsers };
      return { onlineUsers: [...state.onlineUsers, userData] };
    });
  },

  removeOnlineUser: (userId) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u._id !== userId),
    }));
  },

  setTyping: (roomId, userId, username) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [roomId]: { userId, username },
      },
    }));
  },

  clearTyping: (roomId) => {
    set((state) => {
      const newTyping = { ...state.typingUsers };
      delete newTyping[roomId];
      return { typingUsers: newTyping };
    });
  },



  setDMList: (dmList) => set({ dmList }),

  addDMRoom: (room) => {
    set((state) => ({
      dmList: [...state.dmList, room],
    }));
  },
}));
