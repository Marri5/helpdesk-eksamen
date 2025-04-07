import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from local storage on mount
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        setAuthToken(localStorage.token);
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data.data);
          setIsAuthenticated(true);
          setLoading(false);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError(err.response?.data?.msg || 'Authentication failed');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Set auth token in headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Register user
  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setToken(res.data.token);
      setUser(res.data.user);
      setAuthToken(res.data.token);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setToken(res.data.token);
      setUser(res.data.user);
      setAuthToken(res.data.token);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('/auth/logout');
    } catch (err) {
      console.error(err.message);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
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