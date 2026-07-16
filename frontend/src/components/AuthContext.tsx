"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'Business' | 'Worker' | 'Admin';
  skills?: string[];
  location?: string;
  rating?: number;
  experience?: string;
  hourlyPrice?: number;
  avatar?: string;
  portfolio?: string[];
  availability?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  csrfToken: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');
  const router = useRouter();

  // Initialize: Fetch CSRF and check session
  const initializeAuth = async () => {
    try {
      // 1. Fetch CSRF token
      const csrfRes = await fetch('/api/auth/csrf');
      if (csrfRes.ok) {
        const data = await csrfRes.json();
        setCsrfToken(data.csrfToken);
      }

      // 2. Fetch authenticated user profile
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const data = await meRes.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Refresh user profile error:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        
        // Redirect based on user role
        if (data.user.role === 'Admin') {
          router.push('/dashboard/admin');
        } else if (data.user.role === 'Business') {
          router.push('/dashboard/business');
        } else {
          router.push('/dashboard/worker');
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: 'A network error occurred. Please try again.' };
    }
  };

  const signup = async (username: string, email: string, password: string, role: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ username, email, password, role })
      });

      const data = await res.json();
      if (res.ok) {
        // Automatically login the user after successful registration
        return await login(email, password);
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      return { success: false, error: 'A network error occurred. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      // Trigger full page reload to clear memory caches as per secure lifecycle rules
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, csrfToken, login, signup, logout, refreshUser }}>
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
