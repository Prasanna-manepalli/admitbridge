import React, { useState } from 'react';
import { Building2, Upload, Save, CheckCircle } from 'lucide-react';
import { useConsultant } from './ConsultantContext';

/**
 * My Profile: consultancy details, logo upload control, contact info,
 * social links. UI-only — there is no consultant-profile API endpoint,
 * so values live in React state (see ConsultantContext).
 */
const MyProfile = () => {
  const { profile, setProfile } = useConsultant();
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState(profile.logoUrl || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
    setSaved(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview only — the file is not uploaded anywhere (no API exists for this).
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result);
      setProfile((p) => ({ ...p, logoUrl: reader.result }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true); // UI-only save (state already updated on change)
  };

  return (
    <>
      <h1 className="cns-page-title">My Profile</h1>
      <p className="cns-page-sub">Manage how your consultancy appears to students.</p>

      <div className="cns-note">
        <Building2 size={15} />
        This form is not connected to a backend API — changes are kept in React state for this session only.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="cns-card">
          <h2 className="cns-card-title"><Building2 size={18} /> Consultancy Details</h2>
          <div className="cns-form-grid">
            <div className="cns-field">
              <label className="cns-label">Consultancy Name *</label>
              <input className="cns-input" name="consultancyName" value={profile.consultancyName}
                     onChange={handleChange} placeholder="e.g. BrightFuture Consultancy" required />
            </div>
            <div className="cns-field">
              <label className="cns-label">Tagline</label>
              <input className="cns-input" name="tagline" value={profile.tagline}
                     onChange={handleChange} placeholder="e.g. Your gateway to global education" />
            </div>
            <div className="cns-field">
              <label className="cns-label">Years of Experience</label>
              <input className="cns-input" name="yearsOfExperience" type="number" min="0"
                     value={profile.yearsOfExperience} onChange={handleChange} placeholder="e.g. 8" />
            </div>
            <div className="cns-field">
              <label className="cns-label">Students Placed</label>
              <input className="cns-input" name="studentsPlaced" type="number" min="0"
                     value={profile.studentsPlaced} onChange={handleChange} placeholder="e.g. 500" />
            </div>
            <div className="cns-field full">
              <label className="cns-label">About / Bio</label>
              <textarea className="cns-textarea" name="about" value={profile.about}
                        onChange={handleChange}
                        placeholder="Describe your consultancy, expertise and success story..." />
            </div>
            <div className="cns-field full">
              <label className="cns-label">Logo</label>
              <div className="cns-logo-upload">
                <span className="cns-logo-preview">
                  {logoPreview ? <img src={logoPreview} alt="Consultancy logo" /> : <Upload size={22} />}
                </span>
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoChange} id="cns-logo-input" />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.35rem' }}>
                    PNG or JPG, up to 2 MB. Preview only — not uploaded (no API yet).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cns-card">
          <h2 className="cns-card-title"><Building2 size={18} /> Contact Information</h2>
          <div className="cns-form-grid">
            <div className="cns-field">
              <label className="cns-label">Email</label>
              <input className="cns-input" name="email" type="email" value={profile.email}
                     onChange={handleChange} placeholder="contact@yourconsultancy.com" />
            </div>
            <div className="cns-field">
              <label className="cns-label">Phone</label>
              <input className="cns-input" name="phone" value={profile.phone}
                     onChange={handleChange} placeholder="+1 555 000 1234" />
            </div>
            <div className="cns-field">
              <label className="cns-label">City</label>
              <input className="cns-input" name="city" value={profile.city}
                     onChange={handleChange} placeholder="e.g. Hyderabad" />
            </div>
            <div className="cns-field">
              <label className="cns-label">Country</label>
              <input className="cns-input" name="country" value={profile.country}
                     onChange={handleChange} placeholder="e.g. India" />
            </div>
            <div className="cns-field full">
              <label className="cns-label">Website</label>
              <input className="cns-input" name="website" value={profile.website}
                     onChange={handleChange} placeholder="https://yourconsultancy.com" />
            </div>
          </div>
        </div>

        <div className="cns-card">
          <h2 className="cns-card-title"><Building2 size={18} /> Social Links</h2>
          <div className="cns-form-grid">
            {['linkedin', 'facebook', 'instagram', 'youtube'].map((net) => (
              <div className="cns-field" key={net}>
                <label className="cns-label" style={{ textTransform: 'capitalize' }}>{net}</label>
                <input className="cns-input" name={net} value={profile[net]}
                       onChange={handleChange} placeholder={`https://${net}.com/yourpage`} />
              </div>
            ))}
          </div>
        </div>

        <div className="cns-save-bar">
          <button type="submit" className="cns-btn cns-btn-primary">
            <Save size={16} /> Save Changes
          </button>
          {saved && <span className="cns-saved-msg"><CheckCircle size={15} /> Saved (session only)</span>}
        </div>
      </form>
    </>
  );
};

export default MyProfile;
