'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'authToken';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      let storedToken: string | null = null;
      try {
        storedToken = localStorage.getItem(TOKEN_KEY);
      } catch {
        // localStorage unavailable
      }

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3001/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (response.data.success) {
          setToken(storedToken);
          setUser(response.data.data);
        } else {
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch {
            // ignore
          }
        }
      } catch {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const persistSession = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
    } catch {
      // ignore
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      if (!response.data.success) {
        return { success: false, error: response.data.error };
      }
      persistSession(response.data.data.token, response.data.data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to connect to backend' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/signup', { name, email, password });
      if (!response.data.success) {
        return { success: false, error: response.data.error };
      }
      persistSession(response.data.data.token, response.data.data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to connect to backend' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
