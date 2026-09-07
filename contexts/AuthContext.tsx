'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authService } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        // Clear any stale user object
        setUser(null);

        // Only perform a full logout (which clears token + redirects) on 401 Unauthorized
        const status = error?.response?.status;
        if (status === 401) {
          console.warn('[Auth] initAuth detected 401 - performing logout');
          authService.logout();
        } else {
          // For non-auth-related errors (network, server error, etc.) do not force logout
          console.warn('[Auth] initAuth non-401 error — not logging out automatically', { status, message: error?.message });
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: loggedUser } = await authService.login({ email, password });
      setUser(loggedUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}