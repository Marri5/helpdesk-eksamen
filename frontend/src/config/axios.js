import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
    baseURL: 'http://10.12.3.77:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    credentials: 'include'
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Check if token is expired before making request
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    // Token is expired, clear it
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    throw new Error('Token expired');
                }
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                // Invalid token format or expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                throw error;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect to login if not already there and not a background request
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 