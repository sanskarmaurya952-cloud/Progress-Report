import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiFetch } from '../lib/api';

interface RegisterData {
  fullName: string;
  email: string;
  collegeName: string;
  course: string;
  academicYear: string;
  linkedinUrl: string;
  leetcodeUrl: string;
  password: string;
  confirmPassword?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await apiFetch<any>('/auth/me');
      const userData = res?.user || res?.data?.user || (res?.id ? res : null);
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (data: LoginData) => {
    const res = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const userData = res?.user || res?.data?.user || (res?.id ? res : null);
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const res = await apiFetch<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const userData = res?.user || res?.data?.user || (res?.id ? res : null);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
