import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import { SocketProvider } from './context/SocketContext';
import { useStore } from './store/chatStore';
import { getMe } from './services/api';

function ProtectedRoute({ children, isAuth, isLoading }) {
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark-text">Loading...</p>
        </div>
      </div>
    );
  }
  return isAuth ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const setAuthLoading = useStore((state) => state.setAuthLoading);
  const isAuthLoading = useStore((state) => state.isAuthLoading);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // If no token, mark auth check as complete
        if (!token) {
          setAuthLoading(false);
          return;
        }

        // If user already exists, mark auth check as complete
        if (user) {
          setAuthLoading(false);
          return;
        }

        // Verify token and get user data
        const response = await getMe();
        setUser(response.data.user);
        setAuthLoading(false);
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
        setAuthLoading(false);
      }
    };

    verifyAuth();
  }, []); // Run only once on mount

  const LoadingSpinner = () => (
    <div className="w-full h-screen flex items-center justify-center bg-dark-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-dark-text">Loading...</p>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthLoading ? (
            <LoadingSpinner />
          ) : token ? (
            <Navigate to="/chat" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute isAuth={!!token && !!user} isLoading={isAuthLoading}>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute isAuth={!!token && !!user} isLoading={isAuthLoading}>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <SocketProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </SocketProvider>
    </Router>
  );
}

export default App;
