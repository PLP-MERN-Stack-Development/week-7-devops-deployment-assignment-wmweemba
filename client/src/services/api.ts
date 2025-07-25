// client/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Data API (example endpoints - adjust according to your backend)
export const getBorrowers = async () => {
  const response = await api.get('/borrowers');
  return response.data;
};

export const createBorrower = async (borrowerData: any) => {
  const response = await api.post('/borrowers', borrowerData);
  return response.data;
};

// Export all methods as apiService object
export const apiService = {
  login,
  logout,
  getCurrentUser,
  getBorrowers,
  createBorrower,
  // Add other API methods here as needed
};

export default api;