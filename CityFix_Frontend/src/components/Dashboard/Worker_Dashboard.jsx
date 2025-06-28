import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import './User_Dashboard.css';
import apiService from '../../services/apiService';

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

const WorkerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({});
  const [afterPhoto, setAfterPhoto] = useState({});
  const [active, setActive] = useState(true); // default true for safety
  const [profileLoading, setProfileLoading] = useState(true);
  const [workerDbId, setWorkerDbId] = useState(null);

  // Extract workerId (email) from JWT
  const accessToken = user?.accessToken;
  const jwtPayload = parseJwt(accessToken);
  const workerId = jwtPayload.sub;

  // Fetch worker profile to get 'active' status and _id - memoized
  const fetchWorkerProfile = useCallback(async () => {
    if (!workerId || !accessToken) return;
    
    setProfileLoading(true);
    try {
      const profile = await apiService.getWorkerProfile(workerId, accessToken);
      setActive(profile.active);
      setWorkerDbId(profile.id);
    } catch (error) {
      console.error('Error fetching worker profile:', error);
      setActive(false);
    } finally {
      setProfileLoading(false);
    }
  }, [workerId, accessToken]);

  // Fetch assigned reports - memoized
  const fetchAssignedReports = useCallback(async () => {
    if (!workerDbId || !accessToken || !active) return;
    
    setLoading(true);
    try {
      const data = await apiService.getAssignedReports(workerDbId, accessToken);
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching assigned reports:', error);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [workerDbId, accessToken, active]);

  // Fetch worker profile on mount
  useEffect(() => {
    fetchWorkerProfile();
  }, [fetchWorkerProfile]);

  // Fetch assigned reports when dependencies change
  useEffect(() => {
    fetchAssignedReports();
  }, [fetchAssignedReports]);

  // Handle status update
  const handleStatusUpdate = async (reportId) => {
    // Use the value from state, or fallback to the report's current status, or 'IN_PROGRESS'
    const statusValue = statusUpdate[reportId] || reports.find(r => r.id === reportId)?.status || 'IN_PROGRESS';

    const formData = new FormData();
    formData.append('reportId', reportId);
    formData.append('status', statusValue);
    if (afterPhoto[reportId]) {
      formData.append('afterPhoto', afterPhoto[reportId]);
    }
    
    // Debug: print all form data
    for (let pair of formData.entries()) {
      console.log(pair[0]+ ': ' + pair[1]);
    }

    try {
      // Fixed URL - matches backend endpoint '/worker/update_status'
      const response = await fetch(
        `${API_BASE}/reports/worker/update_status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            // Don't set Content-Type header when sending FormData - browser will set it automatically with boundary
          },
          body: formData,
        }
      );
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh reports
      await fetchAssignedReports();
      
      // Clear the form state
      setStatusUpdate(s => ({ ...s, [reportId]: '' }));
      setAfterPhoto(a => ({ ...a, [reportId]: null }));
      
      setError(''); // Clear any previous errors
      
    } catch (err) {
      console.error('Error updating report status:', err);
      setError('Failed to update report status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Assigned Reports</h1>
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
          <button className="dashboard-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {profileLoading ? <div className="dashboard-loading">Checking your status...</div> : null}
      {!profileLoading && !active && (
        <div className="dashboard-error" style={{fontSize: '1.2rem', margin: '32px 0', textAlign: 'center'}}>
          Your application is <b>Pending</b>.<br />Admin has not approved your request yet.
        </div>
      )}
      {!profileLoading && active && (
        <>
          {loading ? <div className="dashboard-loading">Loading...</div> : null}
          {error && <div className="dashboard-error">{error}</div>}
          <div className="dashboard-reports">
            {reports.map(report => (
              <div className="dashboard-report-card" key={report.id}>
                <div><b>Description:</b> {report.description}</div>
                <div><b>Location:</b> {report.location}</div>
                <div><b>Department:</b> {report.department}</div>
                <div><b>Status:</b> {report.status}</div>
                <div><b>Created:</b> {new Date(report.createdAt).toLocaleString()}</div>
                {report.beforePhotoUrl && (
                  <img
                    src={`http://localhost:8080/${report.beforePhotoUrl.replace(/\\/g, '/').replace(/\\/g, '/')}`}
                    alt="Before"
                    className="dashboard-report-img"
                  />
                )}
                {report.afterPhotoUrl && (
                  <img
                    src={`http://localhost:8080/${report.afterPhotoUrl.replace(/\\/g, '/').replace(/\\/g, '/')}`}
                    alt="After"
                    className="dashboard-report-img"
                  />
                )}
                <div className="dashboard-report-actions">
                  <select
                    value={statusUpdate[report.id] || report.status || 'IN_PROGRESS'}
                    onChange={e => setStatusUpdate(s => ({ ...s, [report.id]: e.target.value }))}
                  >
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setAfterPhoto(a => ({ ...a, [report.id]: e.target.files[0] }))}
                  />
                  <button onClick={() => handleStatusUpdate(report.id)}>
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerDashboard;