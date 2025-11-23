import axios from 'axios';

// Determine API base URL.
// Priority: build-time env var -> smart Render fallback -> localhost.
let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

if (!process.env.REACT_APP_API_URL && typeof window !== 'undefined') {
  const host = window.location.hostname;
  // If running on Render without env var, attempt heuristic mapping from frontend to backend.
  // Example: document-platform-frontend.onrender.com -> document-platform-backend.onrender.com
  if (host.endsWith('onrender.com')) {
    const backendHost = host.replace('frontend', 'backend');
    API_URL = `https://${backendHost}`;
    // eslint-disable-next-line no-console
    console.warn('[API] Using heuristic backend URL fallback:', API_URL);
  }
}

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // If no response, it's likely a network error
    if (!error.response) {
      console.error('Network error - backend may not be running');
      error.message = 'Cannot connect to server. Make sure the backend is running on http://localhost:8000';
    }
    
    return Promise.reject(error);
  }
);

export default api;

