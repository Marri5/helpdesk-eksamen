import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        try {
          const res = await axiosInstance.get('/auth/me');
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

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setToken(res.data.token);
      setUser(res.data.user);
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

  const login = async (formData) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setToken(res.data.token);
      setUser(res.data.user);
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

  const logout = async () => {
    try {
      await axiosInstance.get('/auth/logout');
    } catch (err) {
      console.error(err.message);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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