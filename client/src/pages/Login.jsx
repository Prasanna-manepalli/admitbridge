import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

// Demo account emails (editable via env). Emails only — passwords are never
// shipped in frontend code; the demo passwords live in server/src/scripts/seed.js.
const DEMO_ACCOUNTS = [
  { label: 'Student', email: import.meta.env.VITE_DEMO_STUDENT_EMAIL || 'student@admitbridge.com', color: '#34d399', icon: '🎓' },
  { label: 'Consultant', email: import.meta.env.VITE_DEMO_CONSULTANT_EMAIL || 'consultant@admitbridge.com', color: '#818cf8', icon: '💼' },
  { label: 'Admin', email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@admitbridge.com', color: '#fbbf24', icon: '🛡️' },
];

// Default email shown on the (shared) login form — the seeded demo consultant.
// Editable like any other input; the password is always typed by the user.
const DEFAULT_CONSULTANT_EMAIL = DEMO_ACCOUNTS[1].email;

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student', icon: '🎓' },
  { value: 'consultant', label: 'Consultant', icon: '💼' },
  { value: 'admin', label: 'Admin', icon: '🛡️' },
];

const Login = () => {
  const [email, setEmail] = useState(DEFAULT_CONSULTANT_EMAIL);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleDemoSelect = (account) => {
    setEmail(account.email);
    setPassword('');
    setRole(account.label.toLowerCase());
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-box">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to your AdmitBridge account</p>
        
        {error && <div style={{color: '#f87171', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select 
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select your role</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}} disabled={!role}>
            Log In
          </button>
        </form>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #334155)' }}></div>
          <span style={{ margin: '0 1rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #334155)' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                await googleLogin(credentialResponse.credential);
                navigate('/');
              } catch (err) {
                setError(err.response?.data?.message || 'Google Login failed');
              }
            }}
            onError={() => setError('Google Login Failed')}
            theme="filled_black"
            shape="pill"
          />
        </div>

        
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0.75rem 0 0.5rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #334155)' }}></div>
            <span style={{ margin: '0 0.75rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.8rem' }}>Quick fill demo email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #334155)' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => handleDemoSelect(account)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: role === account.label.toLowerCase() ? `2px solid ${account.color}` : '1px solid var(--border)',
                  background: role === account.label.toLowerCase() ? `${account.color}20` : 'rgba(255,255,255,0.03)',
                  color: account.color,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{account.icon}</span>
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
