import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation before hitting the API
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    if (!formData.name.trim() || !emailOk) {
      setError('Please enter your name and a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Only send what the API expects (no confirmPassword)
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      setSuccess('Account created! Redirecting you to your dashboard...');
      // Same design as login: land on "/" and let HomeDirector route by role
      // (consultants go to /consultant/dashboard, students to theirs, etc.)
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-box">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join AdmitBridge today</p>
        
        {error && <div style={{color: '#f87171', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        {success && <div style={{color: '#34d399', marginBottom: '1rem', textAlign: 'center'}}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password"
              name="password"
              className="form-input" 
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input 
              type="password"
              name="confirmPassword"
              className="form-input" 
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select 
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="consultant">Consultant</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
            Sign Up
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
                await googleLogin(credentialResponse.credential, formData.role);
                navigate('/');
              } catch (err) {
                setError(err.response?.data?.message || 'Google Login failed');
              }
            }}
            onError={() => setError('Google Login Failed')}
            theme="filled_black"
            shape="pill"
            text="continue_with"
          />
        </div>

        
        <p style={{marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)'}}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
