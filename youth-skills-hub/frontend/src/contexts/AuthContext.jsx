import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/users/me/');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't clear tokens on error, just set loading to false
      // This prevents the app from breaking if backend is temporarily unavailable
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error('No refresh token');
      }
      
      const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
        refresh,
      });
      
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return access;
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Add axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== 'http://127.0.0.1:8000/api/token/refresh/') {
          originalRequest._retry = true;
          
          try {
            const newAccessToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails, don't break the app, just reject the error
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
        username,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      await fetchUserData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext register called with:', userData);
      
      // Ensure password_confirm is included
      if (!userData.password_confirm) {
        return { success: false, error: { password_confirm: ['This field is required.'] } };
      }
      
      const response = await axios.post('http://127.0.0.1:8000/api/users/', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Registration response:', response.data);
      
      // If registration includes tokens in response, use them
      if (response.data.access && response.data.refresh) {
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        await fetchUserData();
      } else {
        // If no tokens in response, the user needs to login manually
        console.log('No tokens in registration response, user needs to login');
      }
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
