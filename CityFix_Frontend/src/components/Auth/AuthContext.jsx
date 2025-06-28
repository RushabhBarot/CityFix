import React, { useState, useContext, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail,  Lock, Phone, Upload, X } from 'lucide-react';

// Auth Context
const AuthContext = createContext();

// Helper function to parse JWT and extract role
const parseJwt = (token) => {
  if (!token) return {};
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    console.log('Parsed JWT payload:', payload);
    return payload;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return {};
  }
};

// Auth Provider - defined first
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('AuthContext useEffect - accessToken:', accessToken ? 'exists' : 'not found');
    console.log('AuthContext useEffect - refreshToken:', refreshToken ? 'exists' : 'not found');
    
    if (accessToken && refreshToken) {
      const jwtPayload = parseJwt(accessToken);
      console.log('JWT payload on mount (with refresh):', jwtPayload);
      let role = null;
      
      // Try different ways to extract role from JWT
      if (jwtPayload.roles && Array.isArray(jwtPayload.roles) && jwtPayload.roles.length > 0) {
        role = jwtPayload.roles[0];
        console.log('Found role in roles array (with refresh):', role);
      } else if (typeof jwtPayload.roles === 'string') {
        role = jwtPayload.roles;
        console.log('Found role as string (with refresh):', role);
      } else if (typeof jwtPayload.role === 'string') {
        role = jwtPayload.role;
        console.log('Found role in role field (with refresh):', role);
      } else {
        console.warn('No role found in JWT payload (with refresh)');
      }
      
      // Remove ROLE_ prefix if present (Spring Security adds this)
      if (role && role.startsWith('ROLE_')) {
        role = role.substring(5);
        console.log('Removed ROLE_ prefix (with refresh), role is now:', role);
      }
      
      console.log('Extracted role on mount (with refresh):', role);
      setUser({ accessToken, refreshToken, role });
    } else if (accessToken) {
      const jwtPayload = parseJwt(accessToken);
      console.log('JWT payload on mount (access only):', jwtPayload);
      let role = null;
      
      // Try different ways to extract role from JWT
      if (jwtPayload.roles && Array.isArray(jwtPayload.roles) && jwtPayload.roles.length > 0) {
        role = jwtPayload.roles[0];
        console.log('Found role in roles array (access only):', role);
      } else if (typeof jwtPayload.roles === 'string') {
        role = jwtPayload.roles;
        console.log('Found role as string (access only):', role);
      } else if (typeof jwtPayload.role === 'string') {
        role = jwtPayload.role;
        console.log('Found role in role field (access only):', role);
      } else {
        console.warn('No role found in JWT payload (access only)');
      }
      
      // Remove ROLE_ prefix if present (Spring Security adds this)
      if (role && role.startsWith('ROLE_')) {
        role = role.substring(5);
        console.log('Removed ROLE_ prefix (access only), role is now:', role);
      }
      
      console.log('Extracted role on mount (access only):', role);
      setUser({ accessToken, role });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('Login called with userData:', userData);
    const jwtPayload = parseJwt(userData.accessToken);
    console.log('JWT payload in login:', jwtPayload);
    let role = null;
    
    // Try different ways to extract role from JWT
    if (jwtPayload.roles && Array.isArray(jwtPayload.roles) && jwtPayload.roles.length > 0) {
      role = jwtPayload.roles[0];
      console.log('Found role in roles array:', role);
    } else if (typeof jwtPayload.roles === 'string') {
      role = jwtPayload.roles;
      console.log('Found role as string:', role);
    } else if (typeof jwtPayload.role === 'string') {
      role = jwtPayload.role;
      console.log('Found role in role field:', role);
    } else {
      console.warn('No role found in JWT payload');
    }
    
    // Remove ROLE_ prefix if present (Spring Security adds this)
    if (role && role.startsWith('ROLE_')) {
      role = role.substring(5);
      console.log('Removed ROLE_ prefix, role is now:', role);
    }
    
    console.log('Extracted role in login:', role);
    const userWithRole = { ...userData, role };
    console.log('Setting user with role:', userWithRole);
    setUser(userWithRole);
    localStorage.setItem('accessToken', userData.accessToken);
    if (userData.refreshToken) {
      localStorage.setItem('refreshToken', userData.refreshToken);
    }
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