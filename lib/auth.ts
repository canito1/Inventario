import api from './api';
import Cookies from 'js-cookie';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data.data; // Backend returns data in nested format
      
      // Store token in cookie
      Cookies.set('token', token, { expires: 7 }); // 7 days
      
      return { token, user };
    } catch (error: any) {
      // Handle specific error messages from backend
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(message);
    }
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data.data; // Backend returns data in nested format
      
      Cookies.set('token', token, { expires: 7 });
      
      return { token, user };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrar usuario';
      throw new Error(message);
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data.data; // Backend returns data in nested format
    } catch (error: any) {
      console.error('[authService] getCurrentUser error', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw new Error('Error al obtener perfil de usuario');
    }
  },

  logout() {
    // Trace logout invocations for debugging
    console.log('[authService] logout called — removing token and redirecting to /login');
    Cookies.remove('token');
    // Use router navigation instead of direct window.location for better UX
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  },

  getToken(): string | undefined {
    return Cookies.get('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};