import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import apiService from '../../services/apiService';
import { MapPin, Calendar, Building2, AlertCircle, Edit, CheckCircle } from 'lucide-react';
import './User_Dashboard.css';

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

const AssignedReports = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({});
  const [afterPhoto, setAfterPhoto] = useState({});
  const [active, setActive] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [workerDbId, setWorkerDbId] = useState(null);

  // Extract workerId (email) from JWT
  const accessToken = user?.accessToken;
  const jwtPayload = parseJwt(accessToken);
  const workerId = jwtPayload.sub;

  // Fetch worker profile to get 'active' status and _id
  useEffect(() => {
    if (!workerId || !accessToken) return;
    setProfileLoading(true);
    apiService.getWorkerProfile(workerId, accessToken)
      .then(profile => {
        setActive(profile.active);
        setWorkerDbId(profile.id);
      })
      .catch(() => setActive(false))
      .finally(() => setProfileLoading(false));
  }, [workerId, accessToken]);

  // Fetch assigned reports
  useEffect(() => {
    if (!workerDbId || !accessToken || !active) return;
    setLoading(true);
    apiService.getAssignedReports(workerDbId, accessToken)
      .then(data => Array.isArray(data) ? setReports(data) : setReports([]))
      .catch(() => setError('Failed to fetch reports'))
      .finally(() => setLoading(false));
  }, [workerDbId, accessToken, active]);

  // Handle status update
  const handleStatusUpdate = async (reportId) => {
    const statusValue = statusUpdate[reportId] || reports.find(r => r.id === reportId)?.status || 'IN_PROGRESS';

    const formData = new FormData();
    formData.append('reportId', reportId);
    formData.append('status', statusValue);
    if (afterPhoto[reportId]) {
      formData.append('afterPhoto', afterPhoto[reportId]);
    }

    try {
      const response = await fetch(
        `${API_BASE}/reports/worker/update_status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );
      
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh reports
      const reportsData = await apiService.getAssignedReports(workerDbId, accessToken);
      setReports(Array.isArray(reportsData) ? reportsData : []);
      
      // Clear the form state
      setStatusUpdate(s => ({ ...s, [reportId]: '' }));
      setAfterPhoto(a => ({ ...a, [reportId]: null }));
      
      setError('');
      
    } catch (err) {
      console.error('Error updating report status:', err);
      setError('Failed to update report status');
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'assigned': return 'assigned';
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
            <h1>Assigned Reports</h1>
            <p className="dashboard-subtitle">Manage and update your assigned city issue reports</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="dashboard-nav-btn" onClick={() => navigate('/')}>
              Home
            </button>
            <button className="dashboard-nav-btn" onClick={() => navigate('/profile')}>
              Profile
            </button>
            <button className="dashboard-nav-btn active" onClick={() => navigate('/assigned-reports')}>
              Assigned Reports
            </button>
            <button className="dashboard-logout" onClick={() => {
              logout();
              navigate('/login');
            }}>
              Logout
            </button>
          </div>
        </div>

        {profileLoading ? (
          <div className="dashboard-loading">Checking your status...</div>
        ) : !active ? (
          <div className="dashboard-error" style={{fontSize: '1.2rem', margin: '32px 0', textAlign: 'center'}}>
            Your application is <b>Pending</b>.<br />Admin has not approved your request yet.
          </div>
        ) : (
          <>
            {loading && <div className="dashboard-loading">Loading assigned reports...</div>}
            {error && <div className="dashboard-error">{error}</div>}

            {!loading && !error && reports.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  <CheckCircle size={24} />
                </div>
                <h3>No Assigned Reports</h3>
                <p>You don't have any reports assigned to you yet. Check back later!</p>
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
                      
                      {report.beforePhotoUrl && (
                        <img 
                          src={`${API_BASE}/${report.beforePhotoUrl.replace(/\\/g, '/')}`} 
                          alt="Before" 
                          className="dashboard-report-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      {report.afterPhotoUrl && (
                        <img 
                          src={`${API_BASE}/${report.afterPhotoUrl.replace(/\\/g, '/')}`} 
                          alt="After" 
                          className="dashboard-report-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    
                    <div className="dashboard-report-actions">
                      <select
                        value={statusUpdate[report.id] || report.status || 'IN_PROGRESS'}
                        onChange={e => setStatusUpdate(s => ({ ...s, [report.id]: e.target.value }))}
                        className="status-select"
                      >
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setAfterPhoto(a => ({ ...a, [report.id]: e.target.files[0] }))}
                        className="photo-input"
                      />
                      <button 
                        className="update-btn" 
                        onClick={() => handleStatusUpdate(report.id)}
                      >
                        <Edit size={14} />
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssignedReports; 