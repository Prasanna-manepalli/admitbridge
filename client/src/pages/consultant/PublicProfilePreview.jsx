import React from 'react';
import { Globe, Mail, Phone, MapPin, Link2, GraduationCap, Upload } from 'lucide-react';
import { useConsultant, CONSULTANCY_SERVICES } from './ConsultantContext';

/**
 * Public Profile Preview: how the consultancy's public page would look
 * to students. Renders whatever is currently in the shared React state
 * (filled in via My Profile / Services). Read-only preview.
 */
const PublicProfilePreview = () => {
  const { profile, selectedServices, selectedDestinations } = useConsultant();

  const services = CONSULTANCY_SERVICES.filter((s) => selectedServices.includes(s.id));
  const displayName = profile.consultancyName || 'Your Consultancy Name';
  const initials = displayName
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const contactRows = [
    profile.email && { icon: Mail, value: profile.email },
    profile.phone && { icon: Phone, value: profile.phone },
    (profile.city || profile.country) && {
      icon: MapPin,
      value: [profile.city, profile.country].filter(Boolean).join(', '),
    },
    profile.website && { icon: Link2, value: profile.website, href: profile.website },
  ].filter(Boolean);

  return (
    <>
      <h1 className="cns-page-title">Public Profile Preview</h1>
      <p className="cns-page-sub">
        This is how your profile appears to students. Edit it under <strong>My Profile</strong> and <strong>Services</strong>.
      </p>

      <div className="cns-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="cns-preview-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span className="cns-preview-avatar">
              {profile.logoUrl
                ? <img src={profile.logoUrl} alt={displayName} />
                : (profile.consultancyName ? initials : <Upload size={30} />)}
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{displayName}</h2>
              {profile.tagline && (
                <p style={{ margin: '0.3rem 0 0', opacity: 0.9, fontSize: '0.95rem' }}>{profile.tagline}</p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                {profile.yearsOfExperience && (
                  <span className="cns-badge cns-badge-blue" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    {profile.yearsOfExperience} yrs experience
                  </span>
                )}
                {profile.studentsPlaced && (
                  <span className="cns-badge cns-badge-blue" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    {profile.studentsPlaced}+ students placed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="cns-preview-body">
          {profile.about && (
            <>
              <h3 style={{ fontSize: '1rem', margin: '1.5rem 0 0.5rem' }}>About</h3>
              <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.6 }}>{profile.about}</p>
            </>
          )}

          <h3 style={{ fontSize: '1rem', margin: '1.5rem 0 0.5rem' }}>Contact</h3>
          {contactRows.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No contact details added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {contactRows.map(({ icon: Icon, value, href }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#374151', fontSize: '0.9rem' }}>
                  <Icon size={16} color="#2563eb" />
                  {href ? <a href={value} target="_blank" rel="noreferrer">{value}</a> : value}
                </div>
              ))}
            </div>
          )}

          <h3 style={{ fontSize: '1rem', margin: '1.5rem 0 0.5rem' }}>
            <GraduationCap size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
            Services Offered
          </h3>
          {services.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No services selected yet — pick them under Services.</p>
          ) : (
            <div className="cns-chip-row">
              {services.map((s) => (
                <span key={s.id} className="cns-chip selected" style={{ cursor: 'default' }}>{s.name}</span>
              ))}
            </div>
          )}

          <h3 style={{ fontSize: '1rem', margin: '1.5rem 0 0.5rem' }}>
            <Globe size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
            Study Destinations
          </h3>
          {selectedDestinations.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No destinations selected yet.</p>
          ) : (
            <div className="cns-chip-row">
              {selectedDestinations.map((d) => (
                <span key={d} className="cns-chip" style={{ cursor: 'default' }}>{d}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicProfilePreview;
