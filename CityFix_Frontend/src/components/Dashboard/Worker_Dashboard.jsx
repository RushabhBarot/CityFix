import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
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

const WorkerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({});
  const [afterPhoto, setAfterPhoto] = useState({});

  // Extract workerId (email) from JWT
  const accessToken = user?.accessToken;
  const jwtPayload = parseJwt(accessToken);
  const workerId = jwtPayload.sub;

  // Fetch assigned reports
  useEffect(() => {
    if (!workerId) return;
    setLoading(true);
    fetch(`${API_BASE}/reports/worker/assigned?workerId=${workerId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setReports(data) : setReports([]))
      .catch(() => setError('Failed to fetch reports'))
      .finally(() => setLoading(false));
  }, [workerId, accessToken]);

  // Handle status update
  const handleStatusUpdate = async (reportId) => {
    const formData = new FormData();
    formData.append('reportId', reportId);
    formData.append('status', statusUpdate[reportId] || 'IN_PROGRESS');
    if (afterPhoto[reportId]) {
      formData.append('afterPhoto', afterPhoto[reportId]);
    }
    try {
      const response = await fetch(`${API_BASE}/reports/worker/update-status?reportId=${reportId}&status=${statusUpdate[reportId] || 'IN_PROGRESS'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      // Refresh reports
      const res = await fetch(`${API_BASE}/reports/worker/assigned?workerId=${workerId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const reportsData = await res.json();
      setReports(Array.isArray(reportsData) ? reportsData : []);
      setStatusUpdate(s => ({ ...s, [reportId]: '' }));
      setAfterPhoto(a => ({ ...a, [reportId]: null }));
    } catch {
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
        <h1>Assigned Reports</h1>
        <button className="dashboard-logout" onClick={handleLogout}>Logout</button>
      </div>
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
                value={statusUpdate[report.id] || report.status}
                onChange={e => setStatusUpdate(s => ({ ...s, [report.id]: e.target.value }))}
              >
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
    </div>
  );
};

export default WorkerDashboard; 