import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize axios defaults
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Set up axios interceptor for token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        verifyToken();
    }, []);

    const setAuthToken = (token) => {
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const verifyToken = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axios.get('/api/auth/verify');
            setUser(response.data.user);
            setAuthToken(response.data.token);
        } catch (error) {
            if (error.response?.data?.code === 'TOKEN_EXPIRED') {
                logout();
            }
            console.error('Token verification failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/login', { email, password });
            const { user, token } = response.data;
            
            setUser(user);
            setAuthToken(token);
            
            return user;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
            throw new Error(message);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAuthToken(null);
        }
    };

    const getCurrentUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching current user:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            logout,
            getCurrentUser,
            verifyToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 