import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://your-api-url.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors and auto-saving tokens
api.interceptors.response.use(
  (response) => {
    // Auto-save token if it comes in the response
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle specific error status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          // window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Forbidden resource');
          break;
        default:
          // Other errors
          console.error('API Error:', error);
      }
    }
    return Promise.reject(error);
  }
);

// Auth related API calls
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/users/login', { email, password });
    console.log(response.data);
    if (response.data.token) {
      // localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  register: async (email: string, password: string, name: string, role: string) => {
    const response = await api.post('/api/users', { email, password, name, role });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    // return api.post('/auth/logout');
  },

  getProfile: async () => {
    return api.get('/auth/profile');
  },

  loginWithClark: async (code: string, state: string) => {
    const response = await api.post('/auth/clark', { code, state });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }
};

// User related API calls
export const userApi = {
  getUser: async (id: string) => {
    return api.get(`/users/${id}`);
  },
  
  updateUser: async (id: string, data: any) => {
    return api.put(`/users/${id}`, data);
  }
};

// Export the axios instance for direct use
export default api;
