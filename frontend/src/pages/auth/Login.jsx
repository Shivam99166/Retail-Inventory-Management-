import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';

function Login() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultPortal = queryParams.get('portal')?.toUpperCase() === 'CUSTOMER' ? 'CUSTOMER' : 'ADMIN';
  const defaultMode = queryParams.get('mode')?.toUpperCase() === 'FORGOT' ? 'FORGOT_PASSWORD' : 'LOGIN';

  const [activePortal, setActivePortal] = useState(defaultPortal); // 'ADMIN' or 'CUSTOMER'
  const [authMode, setAuthMode] = useState(defaultMode); // 'LOGIN' or 'FORGOT_PASSWORD'
  const [forgotStep, setForgotStep] = useState('REQUEST'); // 'REQUEST' or 'RESET'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password form states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/';

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setError('');
    setSuccessMsg('');
  };

  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setError('');
    setSuccessMsg('');
    if (mode === 'FORGOT_PASSWORD') {
      setForgotStep('REQUEST');
      setForgotEmail(email); // Pre-fill with entered email if any
    }
  };

  const validateEmail = (val) => {
    if (!val || !val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email address.';
    return null;
  };

  // -------------------------------------------------------------
  // Sign In Submission
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login(email.trim().toLowerCase(), password);

      // Wrong-Role Portal Selection Rejection:
      // If a Customer logs into the Retailer/Admin portal tab: reject access.
      if (activePortal === 'ADMIN' && user.role !== 'ADMIN') {
        authService.logout();
        setError('Access Denied: This account has Customer permissions only and cannot access the Retailer / Admin portal. Please switch to the Customer Portal tab to sign in.');
        return;
      }

      // If an Admin logs into the Customer Portal tab: reject access.
      if (activePortal === 'CUSTOMER' && user.role === 'ADMIN') {
        authService.logout();
        setError('Access Denied: This is an Administrator account. Please switch to the Retailer / Admin tab to access operations management.');
        return;
      }

      // Valid portal matching: route to proper destination
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/' || from.startsWith('/admin') ? '/user/dashboard' : from);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('disabled')) {
        setError('Your account has been disabled. Please contact system support.');
      } else if (
        msg.toLowerCase().includes('invalid') ||
        msg.toLowerCase().includes('password') ||
        msg.toLowerCase().includes('credentials') ||
        msg.toLowerCase().includes('bad credentials')
      ) {
        setError('Invalid email or password. Please verify your credentials and try again.');
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Unable to reach the server. Please verify the backend is running on port 8080.');
      } else {
        setError(msg || 'Sign in failed. Please check your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Forgot Password: Step 1 (Request Token)
  // -------------------------------------------------------------
  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const emailError = validateEmail(forgotEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsSubmitting(true);

    try {
      const message = await authService.forgotPassword(forgotEmail.trim().toLowerCase());
      setSuccessMsg(message || 'If an account with this email exists, password reset instructions have been generated.');
    } catch (err) {
      // Backend always returns 200 generic message, but in case of network issue:
      setError(err.message || 'Unable to submit password reset request. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Forgot Password: Step 2 (Reset Password with Token)
  // -------------------------------------------------------------
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetToken.trim()) {
      setError('Password reset token is required.');
      return;
    }
    if (!newPassword) {
      setError('New password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const message = await authService.resetPassword(resetToken.trim(), newPassword);
      setSuccessMsg(message || 'Password has been reset successfully. Please sign in with your new password.');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password. The token may be expired or invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* ============================================================ */}
      {/* Left Panel: Distinct Visual Experience for each portal      */}
      {/* ============================================================ */}
      <div className={`auth-split-left ${activePortal === 'ADMIN' ? 'admin' : 'customer'}`}>
        {/* Brand Header */}
        <div className="auth-brand-row">
          <div className={`auth-brand-logo-icon ${activePortal === 'CUSTOMER' ? 'customer' : ''}`}>
            {activePortal === 'ADMIN' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            )}
          </div>
          <span className="auth-brand-text">
            RetailHub
            <span className={`auth-brand-badge ${activePortal === 'CUSTOMER' ? 'customer' : ''}`}>
              {activePortal === 'ADMIN' ? 'ENTERPRISE OPS' : 'RETAIL STOREFRONT'}
            </span>
          </span>
        </div>

        {/* Hero & Highlights */}
        <div className="auth-left-hero">
          {activePortal === 'ADMIN' ? (
            /* ======================================================== */
            /* Retailer / Admin Portal Visual & Highlights              */
            /* ======================================================== */
            <>
              <h1 className="auth-hero-tagline">
                Enterprise Inventory & Operations Console
              </h1>
              <p className="auth-hero-desc">
                Centralized control for multi-warehouse stock allocations, supplier procurement, purchase orders, and inter-facility transfers.
              </p>

              <div className="auth-feature-list">
                <div className="auth-feature-card admin">
                  <div className="auth-feature-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="auth-feature-title">Multi-Facility Inventory Network</div>
                    <div className="auth-feature-desc">Monitor stock across central warehouses, West Coast hubs, and regional nodes with automated reorder levels.</div>
                  </div>
                </div>

                <div className="auth-feature-card admin">
                  <div className="auth-feature-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <div className="auth-feature-title">Purchase Orders & Supplier Coordination</div>
                    <div className="auth-feature-desc">Draft, approve, and track inbound purchase orders with supplier lead time visibility and receiving audits.</div>
                  </div>
                </div>

                <div className="auth-feature-card admin">
                  <div className="auth-feature-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                  </div>
                  <div>
                    <div className="auth-feature-title">Inter-Warehouse Stock Transfers</div>
                    <div className="auth-feature-desc">Rebalance facility stocks with end-to-end request, approval, and in-transit ledger synchronization.</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ======================================================== */
            /* Customer Portal Visual & Highlights                     */
            /* ======================================================== */
            <>
              <h1 className="auth-hero-tagline">
                Curated Retail Products & Fast Delivery
              </h1>
              <p className="auth-hero-desc">
                Browse our verified product catalog across Electronics, Home Essentials, and Workspace Furniture with live inventory availability.
              </p>

              <div className="auth-feature-list">
                <div className="auth-feature-card customer">
                  <div className="auth-feature-icon customer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <div>
                    <div className="auth-feature-title">Guaranteed In-Stock Storefront</div>
                    <div className="auth-feature-desc">Real-time inventory checks ensure that every item you add to your cart is ready for immediate allocation.</div>
                  </div>
                </div>

                <div className="auth-feature-card customer">
                  <div className="auth-feature-icon customer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <div className="auth-feature-title">Transparent Order Tracking</div>
                    <div className="auth-feature-desc">Follow your order lifecycle from PENDING confirmation through PROCESSING and fulfillment delivery.</div>
                  </div>
                </div>

                <div className="auth-feature-card customer">
                  <div className="auth-feature-icon customer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div>
                    <div className="auth-feature-title">Curated Product Catalog</div>
                    <div className="auth-feature-desc">Shop premium selections across verified retail departments:</div>
                    <div className="auth-storefront-pills">
                      <span className="auth-category-pill">🎧 Electronics</span>
                      <span className="auth-category-pill">🪑 Furniture</span>
                      <span className="auth-category-pill">☕ Home & Kitchen</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Trust Badges */}
        <div className="auth-left-footer">
          <div className="auth-trust-badges">
            <span className="auth-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              256-Bit SSL
            </span>
            <span className="auth-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {activePortal === 'ADMIN' ? 'Spring Security + RBAC' : 'Verified Inventory'}
            </span>
          </div>
          <span>© {new Date().getFullYear()} RetailHub Inc.</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Right Panel: Authentication Forms & Forgot Password          */}
      {/* ============================================================ */}
      <div className="auth-split-right">
        <div className="auth-form-card">
          {/* Header block with mobile brand */}
          <div className="auth-header-block">
            <div className="auth-mobile-brand">
              <div className={`auth-brand-logo-icon ${activePortal === 'CUSTOMER' ? 'customer' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>RetailHub</span>
            </div>

            {/* Portal Switcher Tabs */}
            <div className="auth-portal-tabs" role="tablist" aria-label="Portal Selection">
              <button
                type="button"
                role="tab"
                aria-selected={activePortal === 'ADMIN'}
                className={`auth-portal-tab ${activePortal === 'ADMIN' ? 'active' : ''}`}
                onClick={() => handlePortalSwitch('ADMIN')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Retailer / Admin
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activePortal === 'CUSTOMER'}
                className={`auth-portal-tab ${activePortal === 'CUSTOMER' ? 'active customer' : ''}`}
                onClick={() => handlePortalSwitch('CUSTOMER')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Customer Portal
              </button>
            </div>

            {/* Title / Subtitle Context */}
            {authMode === 'LOGIN' ? (
              <div>
                <span className={`auth-portal-badge ${activePortal === 'ADMIN' ? 'admin' : 'customer'}`}>
                  {activePortal === 'ADMIN' ? 'OPERATIONS & MANAGEMENT' : 'STOREFRONT & ORDERS'}
                </span>
                <h2 className="auth-title">
                  {activePortal === 'ADMIN' ? 'Administrator Login' : 'Customer Sign In'}
                </h2>
                <p className="auth-subtitle">
                  {activePortal === 'ADMIN'
                    ? 'Sign in to manage warehouse inventory, stock transfers, suppliers, and orders.'
                    : 'Sign in to view retail catalog, check stock availability, and manage your orders.'}
                </p>
              </div>
            ) : (
              <div>
                <span className="auth-portal-badge admin">ACCOUNT RECOVERY</span>
                <h2 className="auth-title">Reset Your Password</h2>
                <p className="auth-subtitle">
                  {forgotStep === 'REQUEST'
                    ? 'Enter your registered email address to receive secure reset instructions.'
                    : 'Apply your single-use reset token and choose a new password.'}
                </p>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
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

          {successMsg && (
            <div className="auth-alert-success" role="status">
              <svg className="auth-alert-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>{successMsg}</div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: Standard Login Form                                    */}
          {/* ============================================================ */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} noValidate>
              {/* Email Field */}
              <div className="auth-field">
                <label htmlFor="email" className="auth-label">
                  {activePortal === 'ADMIN' ? 'Administrator Email' : 'Customer Email'}
                </label>
                <div className="auth-input-container">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="auth-input"
                    placeholder={activePortal === 'ADMIN' ? 'admin@company.com' : 'customer@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password" className="auth-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => handleModeSwitch('FORGOT_PASSWORD')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    className="auth-input has-toggle"
                    placeholder="Enter your password"
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

              {/* Submit Button */}
              <button
                type="submit"
                className={`auth-primary-btn ${activePortal === 'CUSTOMER' ? 'customer' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="auth-spinner" aria-hidden="true"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>{activePortal === 'ADMIN' ? 'Sign In as Administrator' : 'Sign In as Customer'}</span>
                )}
              </button>

              {/* Account Provisioning / Registration Context */}
              {activePortal === 'ADMIN' ? (
                <div className="auth-portal-note">
                  <strong>Notice:</strong> Administrator accounts are securely provisioned by the system administrator. Public registration is disabled.
                </div>
              ) : (
                <div className="auth-prompt-row">
                  New to RetailHub Store?{' '}
                  <Link to="/register" className="auth-prompt-link">
                    Create a customer account
                  </Link>
                </div>
              )}
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW: Forgot Password Flow (Request Token / Reset Password)  */}
          {/* ============================================================ */}
          {authMode === 'FORGOT_PASSWORD' && (
            <div>
              {/* Step Toggle Tabs */}
              <div className="auth-step-container">
                <button
                  type="button"
                  className={`auth-step-btn ${forgotStep === 'REQUEST' ? 'active' : ''}`}
                  onClick={() => {
                    setForgotStep('REQUEST');
                    setError('');
                  }}
                >
                  1. Request Reset
                </button>
                <button
                  type="button"
                  className={`auth-step-btn ${forgotStep === 'RESET' ? 'active' : ''}`}
                  onClick={() => {
                    setForgotStep('RESET');
                    setError('');
                  }}
                >
                  2. Apply Token & Reset
                </button>
              </div>

              {forgotStep === 'REQUEST' ? (
                /* Step 1: Request Reset */
                <form onSubmit={handleForgotRequestSubmit} noValidate>
                  <div className="auth-field">
                    <label htmlFor="forgot-email" className="auth-label">
                      Registered Account Email
                    </label>
                    <div className="auth-input-container">
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        className="auth-input"
                        placeholder="user@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
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
                        <span>Generating Instructions...</span>
                      </>
                    ) : (
                      <span>Request Password Reset</span>
                    )}
                  </button>

                  <div className="auth-portal-note" style={{ textAlign: 'left', marginTop: '1rem' }}>
                    <strong>Delivery Notice:</strong> Reset instructions are delivered via email when SMTP is configured. If you already have a token or an administrator provided one, switch to <strong>"Apply Token & Reset"</strong> above.
                  </div>
                </form>
              ) : (
                /* Step 2: Apply Token and Change Password */
                <form onSubmit={handleResetSubmit} noValidate>
                  <div className="auth-field">
                    <label htmlFor="reset-token" className="auth-label">
                      Reset Token
                    </label>
                    <div className="auth-input-container">
                      <input
                        id="reset-token"
                        type="text"
                        className="auth-input"
                        placeholder="Enter the 64-character or provided reset token"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="new-password" className="auth-label">
                      New Password (min. 8 characters)
                    </label>
                    <div className="auth-input-container">
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="auth-input has-toggle"
                        placeholder="Create your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        tabIndex={0}
                      >
                        {showNewPassword ? (
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

                  <div className="auth-field">
                    <label htmlFor="confirm-password" className="auth-label">
                      Confirm New Password
                    </label>
                    <div className="auth-input-container">
                      <input
                        id="confirm-password"
                        type={showNewPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="auth-input"
                        placeholder="Re-enter your new password"
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
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              )}

              {/* Back to Login Button */}
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={() => handleModeSwitch('LOGIN')}
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
