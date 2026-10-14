import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Briefcase, Users, GraduationCap, Target, FileText, Calendar, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import StudentApplicationDetailsModal from '../../components/StudentApplicationDetailsModal';

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected', 'Waitlisted'];

const STATUS_COLORS = {
  'Applied': 'badge-target',
  'Under Review': 'badge-target',
  'Shortlisted': 'badge-safe',
  'Accepted': 'badge-safe',
  'Rejected': 'badge-ambitious',
  'Waitlisted': 'badge-ambitious',
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const ConsultantDashboard = ({ embedded = false }) => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/consultant/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusChange = async (app, newStatus) => {
    if (newStatus === app.status) return;
    setUpdatingId(app._id);
    setStatusMessage('');
    setStatusError('');
    try {
      await api.patch(`/consultant/applications/${app._id}/status`, { status: newStatus });
      setStatusMessage(`Status updated to ${newStatus} for ${app.studentName || app.student?.name}.`);
      await fetchDashboard();
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="container" style={embedded ? {} : { paddingTop: '2rem' }}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="container" style={embedded ? {} : { paddingTop: '2rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <Briefcase size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1rem' }} />
          <h3>{error}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Contact an admin to set up your consultant profile.
          </p>
        </div>
      </div>
    );
  }

  const { profile, assignedStudentProfiles, applications = [] } = data;

  return (
    <div className="container">
      {!embedded && (
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Consultant Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Welcome back, {user.name}!</p>
          </div>
        </div>
      )}

      {(statusMessage || statusError) && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', marginBottom: '1.5rem', color: statusError ? '#f87171' : '#34d399' }}>
          {statusError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {statusError || statusMessage}
        </div>
      )}

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={20} /> Your Profile
        </h2>
        {profile?.bio && <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{profile.bio}</p>}
        {profile?.expertise?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {profile.expertise.map((e) => (
              <span key={e} className="badge badge-safe">{e}</span>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={20} /> Student Applications ({applications.length})
      </h2>

      {applications.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
          <FileText size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No applications yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Applications submitted by your assigned students will appear here.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem', marginBottom: '2rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Profile</th>
                <th>Applied College</th>
                <th>Course</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.studentName || app.student?.name || '—'}</strong>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{app.studentEmail || app.student?.email}</p>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <p>CGPA: {app.studentProfile?.cgpa ?? '—'} ({app.studentProfile?.percentage != null ? `${app.studentProfile.percentage}%` : '—'})</p>
                    <p>GRE: {app.studentProfile?.greScore ?? '—'} • IELTS: {app.studentProfile?.ieltsScore ?? '—'} • TOEFL: {app.studentProfile?.toeflScore ?? '—'}</p>
                    <p>{app.studentProfile?.bachelorDegree || '—'} • {app.studentProfile?.bachelorUniversity || ''}</p>
                  </td>
                  <td>
                    <strong>{app.universityName || app.university?.name}</strong>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{app.country || app.university?.country}</p>
                  </td>
                  <td>{app.course}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                    <Calendar size={13} /> {formatDate(app.submittedDate)}
                  </td>
                  <td>
                    <select
                      className="form-input"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
                      value={app.status}
                      disabled={updatingId === app._id}
                      onChange={(e) => handleStatusChange(app, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className={`badge ${STATUS_COLORS[app.status] || 'badge-target'}`} style={{ marginLeft: '0.5rem' }}>
                      {updatingId === app._id ? 'Saving...' : app.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }} onClick={() => setSelectedApp(app)}>
                      <Eye size={14} style={{ marginRight: '0.3rem' }} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApp && (
        <StudentApplicationDetailsModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}

      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users size={20} /> Assigned Students ({assignedStudentProfiles.length})
      </h2>

      {assignedStudentProfiles.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <GraduationCap size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No students assigned yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Students assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {assignedStudentProfiles.map((student) => (
            <div key={student._id} className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                    {student.user?.name || 'Student'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{student.user?.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GRE</p>
                  <p style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Target size={14} style={{ color: '#818cf8' }} /> {student.greScore ?? '—'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOEFL</p>
                  <p style={{ fontWeight: 'bold' }}>{student.toeflScore ?? '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IELTS</p>
                  <p style={{ fontWeight: 'bold' }}>{student.ieltsScore ?? '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CGPA</p>
                  <p style={{ fontWeight: 'bold' }}>{student.cgpa ?? '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Percentage</p>
                  <p style={{ fontWeight: 'bold' }}>{student.percentage != null ? `${student.percentage}%` : '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Work Exp (mo)</p>
                  <p style={{ fontWeight: 'bold' }}>{student.workExperience ?? 0}</p>
                </div>
              </div>

              {(student.intendedMajor || student.specialization || student.preferredCountry || student.budget) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>
                  <strong>Prefers:</strong> {[student.preferredCountry, student.intendedMajor, student.specialization, student.budget ? `$${student.budget.toLocaleString()}/yr` : ''].filter(Boolean).join(' • ')}
                </p>
              )}

              {(student.bachelorDegree || student.bachelorUniversity) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  {[student.bachelorDegree, student.bachelorUniversity].filter(Boolean).join(' — ')}
                </p>
              )}

              {student.skills?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {student.skills.map((s) => <span key={s} className="badge badge-safe">{s}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultantDashboard;
