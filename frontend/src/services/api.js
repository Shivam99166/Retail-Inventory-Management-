import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('retailhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      // Clear stale credentials only for non-auth requests
      localStorage.removeItem('retailhub_token');
      localStorage.removeItem('retailhub_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Extract the best error message from the response
    const responseData = error.response?.data;
    const message =
      responseData?.message ||
      (typeof responseData === 'string' ? responseData : null) ||
      error.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
