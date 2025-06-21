import React from 'react';  
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import User_Dashboard from './components/Dashboard/User_Dashboard';
import Worker_Dashboard from './components/Dashboard/Worker_Dashboard';
import Admin_Dashboard from './components/Dashboard/Admin_Dashboard';
import PublicRoute from './services/PublicRoutes';
import ProtectedRoute from './services/ProtectedRoutes';
import Logout from './services/Logout';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <User_Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/worker-dashboard" element={
            <ProtectedRoute>
              <Worker_Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <Admin_Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Logout Route */}
          <Route path="/logout" element={<Logout />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;