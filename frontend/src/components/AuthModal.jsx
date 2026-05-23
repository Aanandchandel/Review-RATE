import React, { useState, useEffect } from 'react';
import { registerUser, loginUser } from '../api';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const INIT_LOGIN = { email: '', password: '' };
const INIT_SIGNUP = { name: '', email: '', password: '', confirmPassword: '' };

export default function AuthModal({ initialMode = 'login', onClose }) {
  const { login } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(mode === 'login' ? INIT_LOGIN : INIT_SIGNUP);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const switchMode = (next) => {
    setMode(next);
    setForm(next === 'login' ? INIT_LOGIN : INIT_SIGNUP);
    setErrors({});
    setServerError('');
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (mode === 'signup' && !form.name.trim()) errs.name = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (mode === 'signup' && form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setSubmitting(true);
    try {
      const res = mode === 'login'
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-card" role="dialog" aria-modal="true">
        <span className="auth-blob auth-blob-1" />
        <span className="auth-blob auth-blob-2" />

        <button className="auth-close" onClick={onClose} aria-label="Close">&#10005;</button>

        <h2 className="auth-title">{isLogin ? 'Login' : 'Sign Up'}</h2>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >Login</button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >Sign Up</button>
        </div>

        {serverError && <p className="auth-server-error">{serverError}</p>}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {!isLogin && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={update('name')}
                autoComplete="name"
              />
              {errors.name && <span className="auth-field-error">{errors.name}</span>}
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder={isLogin ? 'Enter your password' : 'Min 6 characters'}
              value={form.password}
              onChange={update('password')}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="auth-field-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? '…' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => switchMode(isLogin ? 'signup' : 'login')}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
