import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  if (!isOpen) return null;

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-green-400 hover:text-pink-400 text-2xl"
        >
          ×
        </button>
        {isLogin ? (
          <Login onToggleForm={toggleForm} />
        ) : (
          <Register onToggleForm={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
