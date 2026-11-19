import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check local storage on mount — restore session if token exists
  useEffect(() => {
    const storedUser = localStorage.getItem('retailhub_user');
    const storedToken = localStorage.getItem('retailhub_token');
    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        // Don't restore if token is a mock token (legacy cleanup)
        if (storedToken === 'mock-admin-token' || storedToken === 'mock-user-token' || storedToken === 'mock-token') {
          localStorage.removeItem('retailhub_user');
          localStorage.removeItem('retailhub_token');
        } else {
          setUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('retailhub_user');
        localStorage.removeItem('retailhub_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // authService.login will call the backend and store the real JWT token
    const res = await authService.login(email, password);
    const userData = {
      name: res.name || res.email,
      email: res.email,
      role: res.role
    };
    setUser(userData);
    // authService already persisted the token; also persist the user object
    localStorage.setItem('retailhub_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, phone = '', address = '') => {
    // authService.register will call the backend and store the real JWT token
    const res = await authService.register(name, email, password, phone, address);
    const userData = {
      name: res.name || email,
      email: res.email,
      role: res.role
    };
    setUser(userData);
    localStorage.setItem('retailhub_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
