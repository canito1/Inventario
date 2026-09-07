import axios from 'axios';
import Cookies from 'js-cookie';

// Prefer the Next dev proxy (/api) when running in development to avoid CORS issues.
// In production, respect NEXT_PUBLIC_API_URL when set.
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || '/api');

// Types
export interface CompanySettings {
  name: string;
  email: string;
  timezone: string;
  defaultCurrency: 'PEN' | 'USD';
  exchangeRate: number;
}

// Create axios instance with timeout and retry configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors and provide better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details to help debug unexpected logouts
    try {
      console.warn('[API] response error', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    } catch (e) {
      console.warn('[API] response error (failed to serialize)', e);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('[API] 401 response - clearing token and redirecting to /login');
      // Clear authentication data
      Cookies.remove('token');
      // Only redirect if we're not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Enhance error object with user-friendly messages
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your connection.';
    } else if (!error.response) {
      error.message = 'Unable to connect to server. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// Settings API
export const settingsAPI = {
  /**
   * Fetch current settings from the backend
   * @returns Promise with settings data
   */
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  /**
   * Update settings in the backend
   * @param settings - Partial settings object to update
   * @returns Promise with updated settings data
   */
  update: async (settings: Partial<CompanySettings>) => {
    const response = await api.put('/settings', settings);
    return response.data;
  }
};

export default api;