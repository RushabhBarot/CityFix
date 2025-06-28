import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import { User, Mail, Phone, Building2, Shield, Edit, Save, X } from 'lucide-react';
import './Profile.css';

const API_BASE = 'http://localhost:8080';

// Helper to decode JWT and get user info
function parseJwt(token) {
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
}

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    department: ''
  });

  // Extract user info from JWT
  const accessToken = user?.accessToken;
  const jwtPayload = parseJwt(accessToken);
  const userId = jwtPayload.sub || jwtPayload.email; // Use email if sub is not available
  const userRole = user?.role;

  console.log('Profile - JWT payload:', jwtPayload);
  console.log('Profile - User ID (sub):', jwtPayload.sub);
  console.log('Profile - User email:', jwtPayload.email);
  console.log('Profile - User role:', userRole);
  console.log('Profile - Access token exists:', !!accessToken);

  // Fetch user profile
  useEffect(() => {
    if (!accessToken || !userId) {
      console.log('Profile - Missing access token or user ID');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        let url;
        if (userRole === 'WORKER') {
          // For workers, use email as the path parameter
          url = `${API_BASE}/users/worker/profile/${userId}`;
        } else if (userRole === 'ADMIN') {
          // For admins, use email as the path parameter
          url = `${API_BASE}/users/admin/profile/${userId}`;
        } else {
          // For citizens, use email as the path parameter
          url = `${API_BASE}/users/citizen/profile/${userId}`;
        }

        console.log('Fetching profile from:', url);
        console.log('User ID:', userId);
        console.log('User Role:', userRole);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        console.log('Profile response status:', response.status);

        if (response.status === 401) {
          console.log('Unauthorized - logging out');
          logout();
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Profile fetch error:', errorText);
          throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data);
        setEditForm({
          name: data.name || '',
          email: data.email || '',
          mobileNumber: data.mobileNumber || '',
          department: data.department || ''
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to fetch profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, accessToken, userRole, logout, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: profile?.name || '',
      email: profile?.email || '',
      mobileNumber: profile?.mobileNumber || '',
      department: profile?.department || ''
    });
  };

  const handleSave = async () => {
    try {
      // For now, just update the local state
      // In a real app, you'd make an API call to update the profile
      setProfile(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleChange = (field) => (e) => {
    setEditForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'USER': return 'Citizen';
      case 'WORKER': return 'Worker';
      case 'ADMIN': return 'Administrator';
      default: return role;
    }
  };

  const getStatusBadge = (active) => {
    return active ? (
      <span className="status-badge active">Active</span>
    ) : (
      <span className="status-badge pending">Pending Approval</span>
    );
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-header-content">
            <h1>Profile</h1>
            <p>Manage your account information</p>
          </div>
          <div className="profile-header-actions">
            <button className="profile-nav-btn" onClick={() => navigate('/')}>
              Home
            </button>
            <button className="profile-nav-btn" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="profile-logout" onClick={() => {
              logout();
              navigate('/login');
            }}>
              Logout
            </button>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            <User className="profile-avatar-icon" />
          </div>

          <div className="profile-info">
            <div className="profile-section">
              <h2>Personal Information</h2>
              <div className="profile-field">
                <label>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={handleChange('name')}
                    className="profile-input"
                  />
                ) : (
                  <span>{profile?.name}</span>
                )}
              </div>

              <div className="profile-field">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={handleChange('email')}
                    className="profile-input"
                  />
                ) : (
                  <span>{profile?.email}</span>
                )}
              </div>

              <div className="profile-field">
                <label>Mobile Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.mobileNumber}
                    onChange={handleChange('mobileNumber')}
                    className="profile-input"
                  />
                ) : (
                  <span>{profile?.mobileNumber}</span>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h2>Account Information</h2>
              <div className="profile-field">
                <label>Role</label>
                <span className="role-badge">{getRoleDisplayName(userRole)}</span>
              </div>

              {userRole === 'WORKER' && (
                <div className="profile-field">
                  <label>Department</label>
                  {isEditing ? (
                    <select
                      value={editForm.department}
                      onChange={handleChange('department')}
                      className="profile-input"
                    >
                      <option value="">Select Department</option>
                      <option value="WASTE_MANAGEMENT">Waste Management</option>
                      <option value="ROAD_MAINTENANCE">Road Maintenance</option>
                      <option value="WATER_SUPPLY">Water Supply</option>
                      <option value="ELECTRICITY">Electricity</option>
                      <option value="PUBLIC_SAFETY">Public Safety</option>
                      <option value="PARKS_RECREATION">Parks & Recreation</option>
                    </select>
                  ) : (
                    <span>{profile?.department?.replace('_', ' ')}</span>
                  )}
                </div>
              )}

              {userRole === 'WORKER' && (
                <div className="profile-field">
                  <label>Status</label>
                  {getStatusBadge(profile?.active)}
                </div>
              )}
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="profile-btn save" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button className="profile-btn cancel" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button className="profile-btn edit" onClick={handleEdit}>
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 