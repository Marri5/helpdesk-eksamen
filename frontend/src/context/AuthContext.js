import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get('/auth/me');
        setUser(res.data.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const updateAuthState = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    setError(null);
  };

  const clearAuthState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axiosInstance.post('/auth/register', formData);
      updateAuthState(res.data.token, res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      
      if (res.data.success && res.data.token) {
        updateAuthState(res.data.token, res.data.user);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      clearAuthState();
      
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers['retry-after'] || 60;
        setError(`Too many login attempts. Please try again in ${retryAfter} seconds.`);
        localStorage.setItem('loginCooldown', (Date.now() + (retryAfter * 1000)).toString());
      } else {
        setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.get('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      clearAuthState();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        error,
        register,
        login,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 