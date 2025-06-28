import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Building2,
  User,
  Shield,
  Plus
} from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Use role from user object
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { path: '/admin-dashboard', label: 'Dashboard', icon: Home },
          { path: '/admin-dashboard/reports', label: 'All Reports', icon: FileText },
          { path: '/admin-dashboard/users', label: 'Users', icon: Users },
          { path: '/admin-dashboard/settings', label: 'Settings', icon: Settings },
        ];
      case 'WORKER':
        return [
          { path: '/worker-dashboard', label: 'Dashboard', icon: Home },
          { path: '/worker-dashboard/assigned', label: 'Assigned Tasks', icon: FileText },
          { path: '/worker-dashboard/profile', label: 'Profile', icon: User },
        ];
      default: // CITIZEN or USER
        return [
          { path: '/dashboard', label: 'My Reports', icon: FileText },
          { path: '/dashboard/new', label: 'New Report', icon: Plus },
          { path: '/dashboard/profile', label: 'Profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleDisplayName = () => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'WORKER': return 'Worker';
      default: return 'Citizen';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'ADMIN': return <Shield size={16} />;
      case 'WORKER': return <Building2 size={16} />;
      default: return <User size={16} />;
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="nav-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation Overlay */}
      {isOpen && (
        <div className="nav-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Navigation Sidebar */}
      <nav className={`nav-sidebar ${isOpen ? 'nav-open' : ''}`}>
        <div className="nav-header">
          <div className="nav-logo">
            <Building2 size={32} />
            <span>CityFix</span>
          </div>
          <button 
            className="nav-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-user">
          <div className="nav-user-avatar">
            <User size={20} />
          </div>
          <div className="nav-user-info">
            <div className="nav-user-name">
              {user?.email || 'User'}
            </div>
            <div className="nav-user-role">
              {getRoleIcon()}
              {getRoleDisplayName()}
            </div>
          </div>
        </div>

        <div className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'nav-active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && <div className="nav-active-indicator" />}
              </button>
            );
          })}
        </div>

        <div className="nav-footer">
          <button className="nav-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navigation; 