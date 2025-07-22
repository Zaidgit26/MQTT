import axios from 'axios';
import { getAuthToken, clearAuthData } from '../utils/auth';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = '/';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle rate limiting
    if (error.response.status === 429) {
      return Promise.reject(new Error('Too many requests. Please try again later.'));
    }

    // Handle server errors
    if (error.response.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  resetPassword: (data) => api.post('/resetpassword', data),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  getCurrentUser: () => {
    const token = getAuthToken();
    if (!token) return Promise.reject(new Error('No authentication token'));
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Promise.resolve({ data: { user: payload } });
    } catch (error) {
      return Promise.reject(new Error('Invalid token'));
    }
  },
};

export const deviceAPI = {
  getDevice: (deviceId) => api.get(`/devices/${deviceId}`),
  getUserDevices: () => api.get('/devices'),
};

export const healthAPI = {
  getHealth: () => api.get('/health'),
  getReadiness: () => api.get('/health/ready'),
};

export default api;
