import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    bio: '',
    skills: '',
    interests: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Watch for user authentication state changes
  useEffect(() => {
    if (user) {
      console.log('User authenticated, navigating to dashboard');
      navigate('/dashboard');
      onToggleForm(); // Close modal
    }
  }, [user, navigate, onToggleForm]);

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

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const userData = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
      interests: formData.interests ? formData.interests.split(',').map(interest => interest.trim()).filter(interest => interest) : [],
    };
    
    // Debug: Log the data being sent
    console.log('Sending registration data:', userData);
    
    const result = await register(userData);
    
    if (!result.success) {
      console.error('Registration failed:', result.error);
      setError(result.error);
    } else {
      console.log('Registration successful!');
      // Navigation will be handled by useEffect when user state updates
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-black border-2 border-green-400 p-6">
      <h2 className="text-2xl text-cyan-400 mb-6 text-center">Create Your Account</h2>

      {error && (
        <div className="bg-red-900 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
          {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-green-400 mb-2">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-green-400 mb-2">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>
        </div>

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

        <div className="mb-4">
          <label className="block text-green-400 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
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

        <div className="mb-4">
          <label className="block text-green-400 mb-2">Confirm Password</label>
          <input
            type="password"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-green-400 mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none h-20"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-green-400 mb-2">Skills (comma-separated)</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
            placeholder="e.g., Python, React, Data Analysis"
          />
        </div>

        <div className="mb-6">
          <label className="block text-green-400 mb-2">Interests (comma-separated)</label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
            placeholder="e.g., Web Development, AI, Entrepreneurship"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-400 text-black py-2 px-4 border-2 border-green-400 hover:bg-black hover:text-green-400 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-green-400">
        Already have an account?{' '}
        <button
          onClick={onToggleForm}
          className="text-cyan-400 hover:text-pink-400 underline"
        >
          Login here
        </button>
      </p>
    </div>
  );
};

export default Register;
