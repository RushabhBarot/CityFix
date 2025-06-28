import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import './User_Dashboard.css';
import { Plus, Edit, Trash2, MapPin, Calendar, Building2, AlertCircle } from 'lucide-react';
import LocationInput from '../UI/LocationInput';

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

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    department: '',
    beforePhoto: null,
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    department: '',
    rating: '',
    citizenVerified: false,
  });

  // Extract citizenId (email) from JWT
  const accessToken = user?.accessToken;
  
  const jwtPayload = parseJwt(accessToken);
  const citizenId = jwtPayload.sub;
  console.log(citizenId);
  
  // Fetch user's reports - memoized with useCallback
  const fetchReports = useCallback(async () => {
    if (!citizenId || !accessToken) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reports/citizen/me?citizenId=${citizenId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [citizenId, accessToken, logout, navigate]);

  // Fetch reports on mount and when dependencies change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle create report
  const handleCreate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
    try {
      const response = await fetch(`${API_BASE}/reports/citizen/create?citizenId=${citizenId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: data,
      });
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setShowForm(false);
      setForm({ description: '', location: '', latitude: '', longitude: '', department: '', beforePhoto: null });
      // Refresh reports
      await fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      setError('Failed to create report');
    }
  };

  // Handle delete report
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const response = await fetch(`${API_BASE}/reports/citizen?reportId=${id}&citizenId=${citizenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setReports(reports.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report');
    }
  };

  // Handle edit (prefill form)
  const startEdit = (report) => {
    setEditId(report.id);
    setEditForm({
      description: report.description,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      department: report.department,
      rating: report.rating || '',
      citizenVerified: report.citizenVerified || false,
    });
  };

  // Handle update report
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/reports/citizen/update-report?reportId=${editId}&citizenId=${citizenId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(editForm),
      });
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setEditId(null);
      // Refresh reports
      await fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report');
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'in_progress': return 'in-progress';
      case 'completed': return 'completed';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <h1>My Reports</h1>
            <p className="dashboard-subtitle">Manage and track your city issue reports</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="dashboard-nav-btn" onClick={() => navigate('/')}>
              Home
            </button>
            <button className="dashboard-nav-btn" onClick={() => navigate('/profile')}>
              Profile
            </button>
            <button className="dashboard-logout" onClick={() => {
              logout();
              navigate('/login');
            }}>
              Logout
            </button>
          </div>
        </div>
        
        <button className="dashboard-create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create New Report'}
        </button>
        
        {showForm && (
          <form className="dashboard-form" onSubmit={handleCreate}>
            <div className="dashboard-form-grid">
              <input 
                type="text" 
                placeholder="Description" 
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                required 
              />
              <LocationInput 
                value={form.location} 
                onChange={(location) => setForm(f => ({ ...f, location: location, latitude: '', longitude: '' }))} 
                required
              />
              <select 
                value={form.department} 
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))} 
                required
              >
                <option value="">Select Department</option>
                <option value="WASTE_MANAGEMENT">Waste Management</option>
                <option value="ROAD_MAINTENANCE">Road Maintenance</option>
                <option value="WATER_SUPPLY">Water Supply</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="PUBLIC_SAFETY">Public Safety</option>
                <option value="PARKS_RECREATION">Parks & Recreation</option>
              </select>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setForm(f => ({ ...f, beforePhoto: e.target.files[0] }))} 
              />
            </div>
            <div className="dashboard-form-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit">Create Report</button>
            </div>
          </form>
        )}

        {editId && (
          <form className="dashboard-form" onSubmit={handleUpdate}>
            <div className="dashboard-form-grid">
              <input 
                type="text" 
                placeholder="Description" 
                value={editForm.description} 
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} 
                required 
              />
              <LocationInput 
                value={editForm.location} 
                onChange={(location) => setEditForm(f => ({ ...f, location: location, latitude: '', longitude: '' }))} 
                required
              />
              <select 
                value={editForm.department} 
                onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} 
                required
              >
                <option value="">Select Department</option>
                <option value="WASTE_MANAGEMENT">Waste Management</option>
                <option value="ROAD_MAINTENANCE">Road Maintenance</option>
                <option value="WATER_SUPPLY">Water Supply</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="PUBLIC_SAFETY">Public Safety</option>
                <option value="PARKS_RECREATION">Parks & Recreation</option>
              </select>
              <input 
                type="number" 
                placeholder="Rating (1-5)" 
                min="1" 
                max="5" 
                value={editForm.rating} 
                onChange={e => setEditForm(f => ({ ...f, rating: e.target.value }))} 
              />
            </div>
            <div className="dashboard-form-actions">
              <button type="button" onClick={() => setEditId(null)}>Cancel</button>
              <button type="submit">Update Report</button>
            </div>
          </form>
        )}

        {loading && <div className="dashboard-loading">Loading reports...</div>}
        {error && <div className="dashboard-error">{error}</div>}

        {!loading && !error && reports.length === 0 && (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              <AlertCircle size={24} />
            </div>
            <h3>No Reports Yet</h3>
            <p>Start by creating your first report to help improve our city!</p>
            <button className="dashboard-create-btn" onClick={() => setShowForm(true)}>
              Create Your First Report
            </button>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="dashboard-reports">
            {reports.map((report) => (
              <div key={report.id} className="dashboard-report-card">
                <div className="dashboard-report-header">
                  <h3 className="dashboard-report-title">{report.description}</h3>
                  <span className={`dashboard-report-status ${getStatusClass(report.status)}`}>
                    {report.status?.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="dashboard-report-content">
                  <p className="dashboard-report-description">{report.description}</p>
                  
                  <div className="dashboard-report-details">
                    <div className="dashboard-report-detail">
                      <MapPin size={14} />
                      <strong>Location:</strong> {report.location}
                    </div>
                    <div className="dashboard-report-detail">
                      <Building2 size={14} />
                      <strong>Department:</strong> {report.department?.replace('_', ' ')}
                    </div>
                    <div className="dashboard-report-detail">
                      <Calendar size={14} />
                      <strong>Created:</strong> {formatDate(report.createdAt)}
                    </div>
                    {report.rating && (
                      <div className="dashboard-report-detail">
                        <strong>Rating:</strong> {report.rating}/5
                      </div>
                    )}
                  </div>
                  
                  {report.beforePhoto && (
                    <img 
                      src={`${API_BASE}/uploads/${report.beforePhoto}`} 
                      alt="Before" 
                      className="dashboard-report-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                
                <div className="dashboard-report-actions">
                  <button 
                    className="edit" 
                    onClick={() => startEdit(report)}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button 
                    className="delete" 
                    onClick={() => handleDelete(report.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;