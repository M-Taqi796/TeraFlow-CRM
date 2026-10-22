import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export function LoginRoute() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate a brief loading state then redirect
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="login-root">
      {/* ─── Left Panel — Form ─── */}
      <div className="login-left">
        {/* Brand mark */}
        <div className="login-brand">
          <img src="/logo.png" alt="TeraFlow Logo" className="login-brand-logo" />
          <span className="login-brand-name">
            TeraFlow<span className="login-brand-dot">.</span>
          </span>
        </div>

        <div className="login-form-wrap">
          <div className="login-heading">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Sign in to your TeraFlow CRM account</p>
          </div>

          <form className="login-form" onSubmit={handleLogin} id="login-form">
            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password" className="login-label">
                Password
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input login-input-with-icon"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  className="login-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password row */}
            <div className="login-row">
              <label className="login-remember">
                <input type="checkbox" id="login-remember" className="login-checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" id="login-forgot" className="login-forgot-btn">
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className={`login-submit ${isLoading ? 'login-submit-loading' : ''}`}
            >
              {isLoading ? (
                <span className="login-spinner" aria-hidden="true" />
              ) : (
                <>
                  Sign In
                  <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <p className="login-footer-text">
            TeraFlow CRM &mdash; &copy; {new Date().getFullYear()} TeraOnic. All rights reserved.
          </p>
        </div>
      </div>

      {/* ─── Right Panel — Illustration / Branding ─── */}
      <div className="login-right">
        <div className="login-right-overlay" />

        <div className="login-right-content">
          <div className="login-right-text">
            <h2 className="login-right-headline">
              Your CRM.<br />
              <span className="login-right-accent">Supercharged.</span>
            </h2>
            <p className="login-right-desc">
              Manage leads, track calls, schedule meetings, and close deals faster — all in one
              beautifully unified platform.
            </p>

            <div className="login-stats">
              <div className="login-stat">
                <span className="login-stat-num">3×</span>
                <span className="login-stat-label">Faster lead tracking</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-num">98%</span>
                <span className="login-stat-label">Customer satisfaction</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-num">24/7</span>
                <span className="login-stat-label">Real-time insights</span>
              </div>
            </div>
          </div>
        </div>

        <img
          src="/login-illustration.jpg"
          alt="TeraFlow CRM Dashboard Preview"
          className="login-right-bg"
        />
      </div>
    </div>
  );
}
