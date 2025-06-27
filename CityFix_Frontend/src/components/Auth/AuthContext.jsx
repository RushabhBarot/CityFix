import React, { useState, useContext, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail,  Lock, Phone, Upload, X } from 'lucide-react';

// Auth Context
const AuthContext = createContext();

// Auth Provider - defined first
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      setUser({ accessToken, refreshToken });
    } else if (accessToken) {
      setUser({ accessToken });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };