import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('unireserve_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'register'
  const { success, error, info } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('unireserve_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to restore user session', err);
      localStorage.removeItem('unireserve_token');
      localStorage.removeItem('unireserve_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwtToken, user: userProfile } = response.data;

      localStorage.setItem('unireserve_token', jwtToken);
      localStorage.setItem('unireserve_user', JSON.stringify(userProfile));
      setToken(jwtToken);
      setUser(userProfile);
      setIsAuthModalOpen(false);
      success(`Welcome back, ${userProfile.fullName}!`);
      return { success: true, user: userProfile };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: jwtToken, user: userProfile } = response.data;

      localStorage.setItem('unireserve_token', jwtToken);
      localStorage.setItem('unireserve_user', JSON.stringify(userProfile));
      setToken(jwtToken);
      setUser(userProfile);
      setIsAuthModalOpen(false);
      success(`Registration successful! Welcome to UniReserve, ${userProfile.fullName}.`);
      return { success: true, user: userProfile };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('unireserve_token');
    localStorage.removeItem('unireserve_user');
    setToken(null);
    setUser(null);
    info('You have been signed out.');
  };

  const quickLogin = async (role) => {
    if (role === 'Administrator') {
      return await login('admin@university.edu', 'Admin@123');
    } else {
      return await login('student@university.edu', 'Student@123');
    }
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = user?.role === 'Administrator';
  const isStudent = user?.role === 'Student';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isStudent,
        login,
        register,
        logout,
        quickLogin,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        refreshProfile: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
