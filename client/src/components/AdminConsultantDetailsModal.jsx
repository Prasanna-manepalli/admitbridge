import React from 'react';
import { X, Briefcase, Users, FileText, Calendar } from 'lucide-react';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Admin view of one consultant: profile, assigned students and their activity.
 * `consultant` comes from GET /api/admin/analytics -> consultants[].
 */
const AdminConsultantDetailsModal = ({ consultant, onClose }) => {
  if (!consultant) return null;

  const profile = consultant.profile || {};

  const Stat = ({ label, value, icon: Icon }) => (
    <div style={{ textAlign: 'center', padding: '0.9rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.6rem', border: '1px solid var(--border)' }}>
      <Icon size={18} style={{ color: 'var(--primary)', marginBottom: '0.35rem' }} />
      <p style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{value}</p>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
  );

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
        style={{ maxWidth: '640px', width: '100%', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{consultant.user?.name || 'Consultant'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{consultant.user?.email}</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} aria-label="Close consultant details">
            <X size={16} />
          </button>
        </div>

        <h4 style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)',
          borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.25rem 0 1rem',
        }}>
          <Briefcase size={16} /> Consultant Profile
        </h4>
        {profile.bio && <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{profile.bio}</p>}
        {profile.expertise?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {profile.expertise.map((e) => <span key={e} className="badge badge-safe">{e}</span>)}
          </div>
        )}
        {!profile.bio && profile.expertise?.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>No consultant profile details set yet.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Stat icon={Users} label="Assigned Students" value={consultant.assignedStudentCount ?? 0} />
          <Stat icon={FileText} label="Applications Handled" value={consultant.applicationCount ?? 0} />
          <Stat icon={Calendar} label="Last Application" value={formatDate(consultant.lastApplicationDate)} />
        </div>

        <h4 style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)',
          borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '0 0 1rem',
        }}>
          <Users size={16} /> Assigned Students
        </h4>
        {consultant.assignedStudents?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {consultant.assignedStudents.map((s) => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.9rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <strong>{s.name}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.email}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No students assigned yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminConsultantDetailsModal;
