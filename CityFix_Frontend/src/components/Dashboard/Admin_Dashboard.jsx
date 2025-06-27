import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import './User_Dashboard.css';

const API_BASE = 'http://localhost:8080';

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

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignWorker, setAssignWorker] = useState({});
  const [filter, setFilter] = useState({ status: '', department: '' });
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [approvingWorkerId, setApprovingWorkerId] = useState(null);
  // Map of department to workers
  const [departmentWorkers, setDepartmentWorkers] = useState({});

  const accessToken = user?.accessToken;

  // Fetch all reports
  const fetchReports = () => {
    setLoading(true);
    let url = `${API_BASE}/reports/admin/all-reports`;
    const params = [];
    if (filter.status) params.push(`status=${filter.status}`);
    if (filter.department) params.push(`department=${filter.department}`);
    if (params.length) url += '?' + params.join('&');
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setReports(data) : setReports([]))
      .catch(() => setError('Failed to fetch reports'))
      .finally(() => setLoading(false));
  };

  // Fetch pending workers
  const fetchPendingWorkers = () => {
    fetch(`${API_BASE}/users/admin/pending-workers`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setPendingWorkers(data) : setPendingWorkers([]))
      .catch(() => setError('Failed to fetch pending workers'));
  };

  // Fetch workers for a department (only if not already fetched)
  const fetchWorkersForDepartment = async (department) => {
    if (!department) return [];
    if (departmentWorkers[department]) return departmentWorkers[department]; // already fetched
    try {
      const res = await fetch(`${API_BASE}/users/admin/active-workers?department=${department}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDepartmentWorkers(prev => ({ ...prev, [department]: Array.isArray(data) ? data : [] }));
      return Array.isArray(data) ? data : [];
    } catch {
      setDepartmentWorkers(prev => ({ ...prev, [department]: [] }));
      setError('Failed to fetch workers for department');
      return [];
    }
  };

  // Fetch all workers for all departments in reports
  useEffect(() => {
    const uniqueDepartments = Array.from(new Set(reports.map(r => r.department).filter(Boolean)));
    uniqueDepartments.forEach(dept => {
      fetchWorkersForDepartment(dept);
    });
    // eslint-disable-next-line
  }, [reports]);

  useEffect(() => {
    fetchReports();
    fetchPendingWorkers();
    // eslint-disable-next-line
  }, [accessToken, filter.status, filter.department]);

  // Approve worker
  const handleApproveWorker = async (workerId) => {
    setApprovingWorkerId(workerId);
    try {
      const response = await fetch(`${API_BASE}/users/admin/approve-worker/${workerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (response.status === 401) {
        logout();
        return;
      }
      fetchPendingWorkers();
      // Optionally, refresh all department workers after approval
      setDepartmentWorkers({}); // Clear cache to force refetch
      fetchReports(); // Refetch reports to update UI
    } catch {
      setError('Failed to approve worker');
    } finally {
      setApprovingWorkerId(null);
    }
  };

  // Assign report to worker
  const handleAssign = async (reportId) => {
    const workerId = assignWorker[reportId];
    if (!workerId) return;
    try {
      const response = await fetch(`${API_BASE}/reports/admin/assign-reports?reportId=${reportId}&workerId=${workerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (response.status === 401) {
        logout();
        return;
      }
      fetchReports();
      setAssignWorker(a => ({ ...a, [reportId]: '' }));
    } catch {
      setError('Failed to assign report');
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Helper: get workers for a department from cache, always return array
  const getWorkersByDepartment = (department) => {
    const workers = departmentWorkers[department];
    return Array.isArray(workers) ? workers : [];
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>All Reports (Admin)</h1>
        <button className="dashboard-logout" onClick={handleLogout}>Logout</button>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select value={filter.department} onChange={e => setFilter(f => ({ ...f, department: e.target.value }))}>
          <option value="">All Departments</option>
          <option value="WASTE_MANAGEMENT">Waste Management</option>
          <option value="PARKING_ENFORCEMENT">Parking Enforcement</option>
          <option value="ROAD_MAINTENANCE">Road Maintenance</option>
        </select>
        <button onClick={fetchReports}>Refresh</button>
      </div>
      {/* Pending Workers Section */}
      <div className="dashboard-pending-workers" style={{ marginBottom: 32 }}>
        <h2>Pending Workers</h2>
        {pendingWorkers.length === 0 ? (
          <div>No pending workers.</div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingWorkers.map(worker => (
                <tr key={worker.id}>
                  <td>{worker.name}</td>
                  <td>{worker.email}</td>
                  <td>{worker.department}</td>
                  <td>
                    <button
                      onClick={() => handleApproveWorker(worker.id)}
                      disabled={approvingWorkerId === worker.id}
                    >
                      {approvingWorkerId === worker.id ? 'Approving...' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
            <div><b>Assigned Worker:</b> {report.assignedWorkerId || 'Unassigned'}</div>
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
                value={assignWorker[report.id] || ''}
                onChange={async e => {
                  setAssignWorker(a => ({ ...a, [report.id]: e.target.value }));
                  if (!departmentWorkers[report.department]) {
                    await fetchWorkersForDepartment(report.department);
                  }
                }}
                style={{ flex: 1 }}
                onFocus={() => fetchWorkersForDepartment(report.department)}
              >
                <option value="">Select worker to assign</option>
                {getWorkersByDepartment(report.department).map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
              <button onClick={() => handleAssign(report.id)}>
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 