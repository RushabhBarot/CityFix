import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import './Dashboard.css';

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
  // Fetch user's reports
  useEffect(() => {
    if (!citizenId) return;
    setLoading(true);
    fetch(`${API_BASE}/reports/citizen/me?citizenId=${citizenId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setReports(data) : setReports([]))
      .catch(() => setError('Failed to fetch reports'))
      .finally(() => setLoading(false));
  }, [citizenId, accessToken]);

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
      const res = await fetch(`${API_BASE}/reports/citizen/me?citizenId=${citizenId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      const reportsData = await res.json();
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch {
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
    } catch {
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
      const res = await fetch(`${API_BASE}/reports/citizen/me?citizenId=${citizenId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      const reportsData = await res.json();
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch {
      setError('Failed to update report');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Reports</h1>
        <button className="dashboard-logout" onClick={handleLogout}>Logout</button>
      </div>
      <button className="dashboard-create-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Create New Report'}
      </button>
      {showForm && (
        <form className="dashboard-form" onSubmit={handleCreate}>
          <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <input type="text" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
          {/* <input type="number" placeholder="Latitude" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} required />
          <input type="number" placeholder="Longitude" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required /> */}
          <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required>
            <option value="">Select Department</option>
            <option value="WASTE_MANAGEMENT">Waste Management</option>
            <option value="PARKING_ENFORCEMENT">Parking Enforcement</option>
            <option value="ROAD_MAINTENANCE">Road Maintenance</option>
          </select>
          <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, beforePhoto: e.target.files[0] }))} required />
          <button type="submit">Submit</button>
        </form>
      )}
      {loading ? <div className="dashboard-loading">Loading...</div> : null}
      {error && <div className="dashboard-error">{error}</div>}
      <div className="dashboard-reports">
        {reports.map(report => (
          <div className="dashboard-report-card" key={report.id}>
            {editId === report.id ? (
              <form className="dashboard-form" onSubmit={handleUpdate}>
                <input type="text" placeholder="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} required />
                <input type="text" placeholder="Location" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} required />
                <input type="number" placeholder="Latitude" value={editForm.latitude} onChange={e => setEditForm(f => ({ ...f, latitude: e.target.value }))} required />
                <input type="number" placeholder="Longitude" value={editForm.longitude} onChange={e => setEditForm(f => ({ ...f, longitude: e.target.value }))} required />
                <select value={editForm.department} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} required>
                  <option value="">Select Department</option>
                  <option value="WASTE_MANAGEMENT">Waste Management</option>
                  <option value="PARKING_ENFORCEMENT">Parking Enforcement</option>
                  <option value="ROAD_MAINTENANCE">Road Maintenance</option>
                </select>
                <input type="number" placeholder="Rating (1-5)" value={editForm.rating} onChange={e => setEditForm(f => ({ ...f, rating: e.target.value }))} />
                <label><input type="checkbox" checked={editForm.citizenVerified} onChange={e => setEditForm(f => ({ ...f, citizenVerified: e.target.checked }))} /> Verified</label>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <div><b>Description:</b> {report.description}</div>
                <div><b>Location:</b> {report.location}</div>
                <div><b>Latitude:</b> {report.latitude}</div>
                <div><b>Longitude:</b> {report.longitude}</div>
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
                <div className="dashboard-report-actions">
                  <button onClick={() => startEdit(report)}>Edit</button>
                  <button onClick={() => handleDelete(report.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;