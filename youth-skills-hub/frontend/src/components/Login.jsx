import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-black border-2 border-green-400 p-6">
      <h2 className="text-2xl text-cyan-400 mb-6 text-center">Login to Your Account</h2>

      {error && (
        <div className="bg-red-900 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-green-400 mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-green-400 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-400 text-black py-2 px-4 border-2 border-green-400 hover:bg-black hover:text-green-400 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-center text-green-400">
        Don't have an account?{' '}
        <button
          onClick={onToggleForm}
          className="text-cyan-400 hover:text-pink-400 underline"
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default Login;
