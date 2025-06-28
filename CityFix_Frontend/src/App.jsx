import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './components/Auth/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserDashboard from './components/Dashboard/User_Dashboard';
import WorkerDashboard from './components/Dashboard/Worker_Dashboard';
import AdminDashboard from './components/Dashboard/Admin_Dashboard';
import ProtectedRoutes from './services/ProtectedRoutes';
import PublicRoutes from './services/PublicRoutes';
import Home from './components/Home/Home';
import Profile from './components/Profile/Profile';
import AssignedReports from './components/Dashboard/AssignedReports';
import './index.css';

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
    console.log('App.jsx - Parsed JWT payload:', payload);
    return payload;
  } catch (error) {
    console.error('App.jsx - Error parsing JWT token:', error);
    return {};
  }
};

function AppContent() {
  const { user } = useContext(AuthContext);

  const getDashboardComponent = () => {
    if (!user || !user.accessToken) {
      console.log('No user or access token found');
      return null;
    }
    
    const jwtPayload = parseJwt(user.accessToken);
    let role = null;
    
    // Try different ways to extract role from JWT
    if (jwtPayload.roles && Array.isArray(jwtPayload.roles) && jwtPayload.roles.length > 0) {
      role = jwtPayload.roles[0];
      console.log('App.jsx - Found role in roles array:', role);
    } else if (typeof jwtPayload.roles === 'string') {
      role = jwtPayload.roles;
      console.log('App.jsx - Found role as string:', role);
    } else if (typeof jwtPayload.role === 'string') {
      role = jwtPayload.role;
      console.log('App.jsx - Found role in role field:', role);
    } else {
      console.warn('App.jsx - No role found in JWT payload');
    }
    
    // Remove ROLE_ prefix if present (Spring Security adds this)
    if (role && role.startsWith('ROLE_')) {
      role = role.substring(5);
      console.log('App.jsx - Removed ROLE_ prefix, role is now:', role);
    }
    
    console.log('JWT payload:', jwtPayload);
    console.log('Extracted role:', role);
    console.log('User object:', user);
    
    switch (role) {
      case 'ADMIN':
        console.log('Rendering Admin Dashboard');
        return <AdminDashboard />;
      case 'WORKER':
        console.log('Rendering Worker Dashboard');
        return <WorkerDashboard />;
      case 'USER':
      case 'CITIZEN':
        console.log('Rendering User Dashboard');
        return <UserDashboard />;
      default:
        console.log('No role found, defaulting to User Dashboard');
        return <UserDashboard />;
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicRoutes>
              <Home />
            </PublicRoutes>
          } />
          <Route path="/login" element={
            <PublicRoutes>
              <Login />
            </PublicRoutes>
          } />
          <Route path="/register" element={
            <PublicRoutes>
              <Register />
            </PublicRoutes>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoutes>
              {getDashboardComponent()}
            </ProtectedRoutes>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoutes>
              <AdminDashboard />
            </ProtectedRoutes>
          } />
          <Route path="/worker-dashboard" element={
            <ProtectedRoutes>
              <WorkerDashboard />
            </ProtectedRoutes>
          } />
          <Route path="/profile" element={
            <ProtectedRoutes>
              <Profile />
            </ProtectedRoutes>
          } />
          <Route path="/assigned-reports" element={
            <ProtectedRoutes>
              <AssignedReports />
            </ProtectedRoutes>
          } />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;


