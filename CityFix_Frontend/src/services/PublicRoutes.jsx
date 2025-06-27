import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../components/Auth/AuthContext';

const parseJwt = (token) => {
  if (!token) return {};
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user && user.accessToken) {
    const jwtPayload = parseJwt(user.accessToken);
    let role = null;
    if (Array.isArray(jwtPayload.roles)) {
      role = jwtPayload.roles[0];
    } else if (typeof jwtPayload.roles === 'string') {
      role = jwtPayload.roles;
    } else if (typeof jwtPayload.role === 'string') {
      role = jwtPayload.role;
    }
    if (role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (role === 'WORKER') {
      return <Navigate to="/worker-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PublicRoute;