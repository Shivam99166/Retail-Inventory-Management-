import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) {
      return 'Full name must be at least 2 characters.';
    }
    if (!email.trim()) {
      return 'Email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim(), address.trim());
      setSuccessMsg('Account created successfully! Redirecting to your customer storefront...');
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 1000);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already in use') || msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('email')) {
        setError('This email address is already registered. Please sign in or use a different email.');
      } else if (msg.toLowerCase().includes('validation')) {
        setError('Please check your input details and try again.');
      } else {
        setError(msg || 'Registration failed. Please check your network and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div className="auth-brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>RetailHub</span>
            <span className="auth-brand-badge" style={{ marginLeft: '8px' }}>STOREFRONT</span>
          </div>
        </div>

        <h1 className="auth-title" style={{ fontSize: '1.45rem' }}>Create Customer Account</h1>
        <p className="auth-subtitle" style={{ marginBottom: '1.25rem' }}>
          Register to browse inventory, order items, and track live deliveries.
        </p>

        {/* Success Alert */}
        {successMsg && (
          <div className="auth-alert-success" role="status">
            <svg className="auth-alert-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>{successMsg}</div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="auth-alert-error" role="alert">
            <svg className="auth-alert-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="name" className="auth-label">
              Full Name *
            </label>
            <div className="auth-input-container">
              <input
                id="name"
                type="text"
                className="auth-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="reg-email" className="auth-label">
              Email Address *
            </label>
            <div className="auth-input-container">
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                className="auth-input"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Phone (Optional) */}
          <div className="auth-field">
            <label htmlFor="phone" className="auth-label">
              Phone Number <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
            </label>
            <div className="auth-input-container">
              <input
                id="phone"
                type="tel"
                className="auth-input"
                placeholder="555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Address (Optional) */}
          <div className="auth-field">
            <label htmlFor="address" className="auth-label">
              Shipping Address <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
            </label>
            <div className="auth-input-container">
              <input
                id="address"
                type="text"
                className="auth-input"
                placeholder="123 Market St, Suite 400"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="reg-password" className="auth-label">
              Password * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(min. 8 characters)</span>
            </label>
            <div className="auth-input-container">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="auth-input has-toggle"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm Password *
            </label>
            <div className="auth-input-container">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="auth-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="auth-spinner" aria-hidden="true"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Customer Account</span>
            )}
          </button>
        </form>

        <div className="auth-portal-note" style={{ marginTop: '1.25rem' }}>
          <strong>Notice:</strong> This form creates a customer shopping account. For administrator access, contact your organization.
        </div>

        <div className="auth-prompt-row">
          Already have an account?{' '}
          <Link to="/login" className="auth-prompt-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
