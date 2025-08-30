import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

export type UserRole = 'admin' | 'shift_lead' | 'crew';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  location?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signInWithClark: (code: string, state: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ Initialize user from localStorage
  const storedUser = localStorage.getItem('user_profile');
  const initialUser: UserProfile | null = storedUser ? JSON.parse(storedUser) : null;

  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authApi.getProfile();
      const userData = response.data;

      const profile: UserProfile = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        location: userData.location,
      };

      setUser(profile);
      localStorage.setItem('user_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error fetching user profile:', error);

      // fallback already handled by initial value
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const userData = response.user || response;

      if (userData.token) {
        localStorage.setItem('auth_token', userData.token);
      }

      const profile: UserProfile = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        location: userData.location,
      };

      localStorage.setItem('user_profile', JSON.stringify(profile));
      setUser(profile);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw { message: error.response?.data?.detail || 'Login failed' };
    }
  };

  const signOut = async () => {
    try {
      // await authApi.logout();
      localStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      setUser(null);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const response = await authApi.register(email, password, name, role);
      const userData = response.user || response;

      if (userData.token) {
        localStorage.setItem('auth_token', userData.token);
      }

      const profile: UserProfile = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        location: userData.location,
      };

      localStorage.setItem('user_profile', JSON.stringify(profile));
      setUser(profile);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithClark = async (code: string, state: string) => {
    try {
      const savedState = localStorage.getItem('clark_auth_state');
      if (!savedState || savedState !== state) {
        throw new Error('Invalid state parameter');
      }

      localStorage.removeItem('clark_auth_state');

      const response = await authApi.loginWithClark(code, state);
      const userData = response.user || response;

      if (userData.token) {
        localStorage.setItem('auth_token', userData.token);
      }

      const profile: UserProfile = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        location: userData.location,
      };

      localStorage.setItem('user_profile', JSON.stringify(profile));
      setUser(profile);
    } catch (error) {
      console.error('Clark login error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    signInWithClark,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
