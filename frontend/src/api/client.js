import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.replace(/\/$/, '').endsWith('/api')
      ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
      : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unireserve_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login/register, clear expired token
      const currentPath = window.location.pathname;
      if (!currentPath.includes('login')) {
        // We let the auth context handle logout gracefully
      }
    }
    return Promise.reject(error);
  }
);

export default api;
