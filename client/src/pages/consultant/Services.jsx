import React, { useState } from 'react';
import { Briefcase, MapPin, Save, CheckCircle, Check } from 'lucide-react';
import { useConsultant, CONSULTANCY_SERVICES, DESTINATIONS } from './ConsultantContext';

/**
 * Services: selectable admission services + study destinations.
 * UI-only — selections live in React state (shared with Dashboard/Preview).
 */
const Services = () => {
  const {
    selectedServices, toggleService,
    selectedDestinations, toggleDestination,
  } = useConsultant();
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <>
      <h1 className="cns-page-title">Services</h1>
      <p className="cns-page-sub">Choose the services you offer and the destinations you cover.</p>

      <div className="cns-note">
        <Briefcase size={15} />
        Selections are kept in React state for this session — no backend API is connected yet.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="cns-card">
          <h2 className="cns-card-title">
            <Briefcase size={18} /> Admission Services ({selectedServices.length} selected)
          </h2>
          <div className="cns-service-grid">
            {CONSULTANCY_SERVICES.map((svc) => {
              const selected = selectedServices.includes(svc.id);
              return (
                <button
                  type="button"
                  key={svc.id}
                  className={`cns-service-card${selected ? ' selected' : ''}`}
                  onClick={() => { toggleService(svc.id); setSaved(false); }}
                  aria-pressed={selected}
                >
                  <span className="cns-service-name">
                    {svc.name}
                    <span
                      className={`cns-badge ${selected ? 'cns-badge-blue' : 'cns-badge-gray'}`}
                    >
                      {selected ? <><Check size={12} /> Selected</> : 'Select'}
                    </span>
                  </span>
                  <span className="cns-service-desc">{svc.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="cns-card">
          <h2 className="cns-card-title">
            <MapPin size={18} /> Study Destinations ({selectedDestinations.length} selected)
          </h2>
          <div className="cns-chip-row">
            {DESTINATIONS.map((dest) => {
              const selected = selectedDestinations.includes(dest);
              return (
                <button
                  type="button"
                  key={dest}
                  className={`cns-chip${selected ? ' selected' : ''}`}
                  onClick={() => { toggleDestination(dest); setSaved(false); }}
                  aria-pressed={selected}
                >
                  {selected && <Check size={14} />}
                  {dest}
                </button>
              );
            })}
          </div>
        </div>

        <div className="cns-save-bar">
          <button type="submit" className="cns-btn cns-btn-primary">
            <Save size={16} /> Save Services
          </button>
          {saved && <span className="cns-saved-msg"><CheckCircle size={15} /> Saved (session only)</span>}
        </div>
      </form>
    </>
  );
};

export default Services;
