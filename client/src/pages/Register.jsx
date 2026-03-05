import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useStore } from '../store/chatStore';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted');

    if (password !== confirmPassword) {
      console.warn('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending registration request with:', { username, email });
      const response = await register(username, email, password);
      console.log('Registration response:', response.data);

      const { token, user } = response.data;

      setToken(token);
      setUser(user);

      toast.success('Registration successful!');
      navigate('/chat');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[100dvh] flex items-center justify-center bg-dark-bg overflow-y-auto py-8">
      <div className="w-96 bg-dark-card border border-white border-opacity-10 rounded-card p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-dark-text mb-8 text-center">Chat App</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-dark-text mb-2 text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              className="w-full px-4 py-2 bg-dark-bg border border-white border-opacity-10 rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

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

          <div>
            <label className="block text-dark-text mb-2 text-sm">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-dark-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
