import React, { useState, useContext } from 'react';
import { Mail, KeyRound, Save, CheckCircle, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useConsultant } from './ConsultantContext';

/**
 * Account Settings: email + change-password forms.
 * UI-only — no backend endpoints exist for changing email/password from
 * the consultant area, so submitting only shows local confirmation.
 */
const AccountSettings = () => {
  const { user } = useContext(AuthContext);
  const { account, setAccount } = useConsultant();

  const [emailSaved, setEmailSaved] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState(null); // { ok, text }

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmailSaved(true); // UI-only
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    if (pwd.next.length < 8) {
      setPwdMsg({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    // UI-only: not sent to any API.
    setPwdMsg({ ok: true, text: 'Password validated. (UI only — not connected to a backend API yet.)' });
    setPwd({ current: '', next: '', confirm: '' });
  };

  return (
    <>
      <h1 className="cns-page-title">Account Settings</h1>
      <p className="cns-page-sub">Manage your login email and password.</p>

      <div className="cns-note">
        <ShieldCheck size={15} />
        These forms are not connected to a backend API — no changes are sent anywhere yet.
      </div>

      <div className="cns-card" style={{ maxWidth: 560 }}>
        <h2 className="cns-card-title"><Mail size={18} /> Email Address</h2>
        <form onSubmit={handleEmailSubmit}>
          <div className="cns-field" style={{ marginBottom: '1rem' }}>
            <label className="cns-label">Current account</label>
            <input className="cns-input" value={user?.email || ''} disabled
                   style={{ background: '#f9fafb', color: '#6b7280' }} />
          </div>
          <div className="cns-field" style={{ marginBottom: '1rem' }}>
            <label className="cns-label">New email address</label>
            <input className="cns-input" type="email" required
                   value={account.email}
                   onChange={(e) => { setAccount({ ...account, email: e.target.value }); setEmailSaved(false); }}
                   placeholder="new-email@example.com" />
          </div>
          <div className="cns-save-bar" style={{ marginTop: 0 }}>
            <button type="submit" className="cns-btn cns-btn-primary"><Save size={16} /> Update Email</button>
            {emailSaved && <span className="cns-saved-msg"><CheckCircle size={15} /> Saved (session only)</span>}
          </div>
        </form>
      </div>

      <div className="cns-card" style={{ maxWidth: 560 }}>
        <h2 className="cns-card-title"><KeyRound size={18} /> Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="cns-field" style={{ marginBottom: '1rem' }}>
            <label className="cns-label">Current password</label>
            <input className="cns-input" type="password" required autoComplete="current-password"
                   value={pwd.current}
                   onChange={(e) => { setPwd({ ...pwd, current: e.target.value }); setPwdMsg(null); }} />
          </div>
          <div className="cns-form-grid" style={{ marginBottom: '1rem' }}>
            <div className="cns-field">
              <label className="cns-label">New password</label>
              <input className="cns-input" type="password" required autoComplete="new-password"
                     value={pwd.next}
                     onChange={(e) => { setPwd({ ...pwd, next: e.target.value }); setPwdMsg(null); }} />
            </div>
            <div className="cns-field">
              <label className="cns-label">Confirm new password</label>
              <input className="cns-input" type="password" required autoComplete="new-password"
                     value={pwd.confirm}
                     onChange={(e) => { setPwd({ ...pwd, confirm: e.target.value }); setPwdMsg(null); }} />
            </div>
          </div>
          <div className="cns-save-bar" style={{ marginTop: 0 }}>
            <button type="submit" className="cns-btn cns-btn-primary"><KeyRound size={16} /> Change Password</button>
            {pwdMsg && (
              <span className="cns-saved-msg" style={{ color: pwdMsg.ok ? '#15803d' : '#b91c1c' }}>
                {pwdMsg.ok ? <CheckCircle size={15} /> : <ShieldCheck size={15} />} {pwdMsg.text}
              </span>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default AccountSettings;
