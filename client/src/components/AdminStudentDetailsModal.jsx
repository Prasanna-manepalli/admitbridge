import React, { useState } from 'react';
import { X, GraduationCap, Compass, FileText, Calendar, Eye } from 'lucide-react';
import StudentApplicationDetailsModal from './StudentApplicationDetailsModal';

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

/**
 * Admin view of one student: complete profile + list of their applications.
 * `student` comes from GET /api/admin/analytics -> students[].
 * `allApplications` holds the fully populated application records (with
 * studentProfile/university) so each row can open StudentApplicationDetailsModal.
 */
const AdminStudentDetailsModal = ({ student, allApplications, onClose }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  if (!student) return null;

  const profile = student.profile || {};
  const Row = ({ label, value }) => (
    <div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontWeight: 500 }}>{value ?? '—'}</p>
    </div>
  );

  const openFullApp = (appId) => {
    const full = allApplications.find((a) => a._id === appId);
    if (full) setSelectedApp(full);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 200, padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{ maxWidth: '820px', width: '100%', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{student.user?.name || 'Student'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{student.user?.email}</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} aria-label="Close student details">
            <X size={16} />
          </button>
        </div>

        <h4 style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)',
          borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.25rem 0 1rem',
        }}>
          <GraduationCap size={16} /> Student Profile
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem 1.25rem' }}>
          <Row label="CGPA" value={profile.cgpa} />
          <Row label="Percentage" value={profile.percentage != null ? `${profile.percentage}%` : null} />
          <Row label="IELTS" value={profile.ieltsScore} />
          <Row label="TOEFL" value={profile.toeflScore} />
          <Row label="GRE" value={profile.greScore} />
          <Row label="Bachelor's Degree" value={profile.bachelorDegree} />
          <Row label="Bachelor's University" value={profile.bachelorUniversity} />
          <Row label="Work Experience" value={profile.workExperience != null ? `${profile.workExperience} months` : null} />
          <Row label="Research Experience" value={profile.researchExperience != null ? `${profile.researchExperience} months` : null} />
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Skills</p>
            {profile.skills?.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {profile.skills.map((s) => <span key={s} className="badge badge-safe">{s}</span>)}
              </div>
            ) : <p style={{ fontWeight: 500 }}>—</p>}
          </div>
        </div>

        <h4 style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)',
          borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem',
        }}>
          <Compass size={16} /> Study Preference
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem 1.25rem' }}>
          <Row label="Country" value={profile.preferredCountry} />
          <Row label="Course" value={profile.intendedMajor} />
          <Row label="Specialization" value={profile.specialization} />
          <Row label="Budget / Year" value={profile.budget != null ? `$${profile.budget.toLocaleString()}` : null} />
          <Row label="Target Term" value={profile.targetTerm} />
        </div>

        <h4 style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)',
          borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem',
        }}>
          <FileText size={16} /> Applications ({student.applications?.length || 0})
        </h4>
        {student.applications?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            {student.applications.map((app) => (
              <div
                key={app._id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '1rem', padding: '0.75rem 1rem', borderRadius: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600 }}>{app.universityName || '—'}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {app.course} {app.country ? `• ${app.country}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={12} /> {formatDate(app.submittedDate)}
                  </span>
                  <span className={`badge ${STATUS_COLORS[app.status] || 'badge-target'}`}>{app.status}</span>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => openFullApp(app._id)}>
                    <Eye size={13} style={{ marginRight: '0.25rem' }} /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>This student has not applied to any colleges yet.</p>
        )}
      </div>

      {selectedApp && (
        <StudentApplicationDetailsModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default AdminStudentDetailsModal;
