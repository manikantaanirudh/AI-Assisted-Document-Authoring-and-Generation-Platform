import axios from 'axios';

// Determine API base URL with enhanced diagnostics.
// Order: explicit env var -> forced Render hostname rewrite -> localhost.
let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  // Force rewrite if we detect a Render frontend host.
  if (host.includes('onrender.com') && host.includes('frontend')) {
    const backendHost = host.replace('frontend', 'backend');
    API_URL = `https://${backendHost}`;
    // eslint-disable-next-line no-console
    console.log('[API] Render host detected. Using backend URL:', API_URL);
  } else if (!process.env.REACT_APP_API_URL && host !== 'localhost') {
    // Non-local host but no env var: warn.
    // eslint-disable-next-line no-console
    console.warn('[API] No REACT_APP_API_URL set. Host:', host, 'Using default:', API_URL);
  }
  // Expose for manual browser inspection.
  // @ts-ignore
  window.__API_URL__ = API_URL;
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

