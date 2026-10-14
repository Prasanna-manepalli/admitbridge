import React from 'react';
import { Eye, Mail, Briefcase, BadgeCheck } from 'lucide-react';
import { useConsultant } from './ConsultantContext';
import ConsultantDashboard from './ConsultantDashboard';

/**
 * Consultancy Dashboard: stat cards on top, then the existing
 * applications/assigned-students dashboard (reused unchanged).
 *
 * The four stat numbers are UI-only demo values — there is no backend
 * endpoint for profile views / enquiries yet.
 */
const Dashboard = () => {
  const { selectedServices, profile } = useConsultant();

  const stats = [
    { label: 'Profile Views', value: 128, icon: Eye, bg: '#dbeafe', fg: '#2563eb' },
    { label: 'Enquiries', value: 12, icon: Mail, bg: '#dcfce7', fg: '#15803d' },
    { label: 'Active Services', value: selectedServices.length, icon: Briefcase, bg: '#fef3c7', fg: '#b45309' },
    {
      label: 'Verification',
      value: profile.consultancyName ? 'Pending' : 'Not started',
      icon: BadgeCheck,
      bg: '#f3f4f6',
      fg: '#4b5563',
    },
  ];

  return (
    <>
      <h1 className="cns-page-title">Dashboard</h1>
      <p className="cns-page-sub">Overview of your consultancy activity.</p>

      <div className="cns-stats">
        {stats.map(({ label, value, icon: Icon, bg, fg }) => (
          <div key={label} className="cns-stat-card">
            <span className="cns-stat-icon" style={{ background: bg, color: fg }}>
              <Icon size={22} />
            </span>
            <div>
              <div className="cns-stat-value">{value}</div>
              <div className="cns-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cns-note">
        <Eye size={15} />
        Profile Views and Enquiries are demo numbers — not connected to a backend API yet.
      </div>

      {/* Existing, API-connected dashboard (applications + assigned students) reused as-is */}
      <div style={{ background: 'transparent' }}>
        <ConsultantDashboard embedded />
      </div>
    </>
  );
};

export default Dashboard;
