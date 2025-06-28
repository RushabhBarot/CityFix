import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../components/Auth/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !user.accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Use role from user object
  const role = user.role;

  // Route-based role checks
  if (location.pathname.startsWith('/admin-dashboard') && role !== 'ADMIN') {
    if (role === 'WORKER') return <Navigate to="/worker-dashboard" replace />;
    if (role === 'USER' || role === 'CITIZEN') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  if (location.pathname.startsWith('/worker-dashboard') && role !== 'WORKER') {
    if (role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'USER' || role === 'CITIZEN') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  if (location.pathname.startsWith('/dashboard') && (role === 'ADMIN' || role === 'WORKER')) {
    if (role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'WORKER') return <Navigate to="/worker-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;