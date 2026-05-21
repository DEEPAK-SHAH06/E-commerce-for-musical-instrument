// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api', // adjust if backend port is different
});

// Add a request interceptor to include JWT token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
