'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, api, tokenStorage } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.login(data);
      tokenStorage.setTokens(res.access, res.refresh);
      const userData = await api.getMe();
      setUser(userData);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; first_name?: string; last_name?: string }) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      tokenStorage.setTokens(res.access, res.refresh);
      setUser(res.user);
      router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
