import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { useStore } from '../store/chatStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);
      const { token, user } = response.data;

      setToken(token);
      setUser(user);

      toast.success('Login successful!');
      navigate('/chat');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[100dvh] flex items-center justify-center bg-dark-bg">
      <div className="w-96 bg-dark-card border border-white border-opacity-10 rounded-card p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-dark-text mb-8 text-center">Chat App</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-dark-text mb-2 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2 bg-dark-bg border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-dark-text mb-2 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 bg-dark-bg border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-primary hover:bg-primary-hover text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-dark-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
