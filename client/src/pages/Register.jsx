import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowRight, Sun, Moon } from 'lucide-react';

const CURRENCIES = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: '¥', label: 'JPY (¥)' },
  { symbol: 'C$', label: 'CAD (C$)' },
  { symbol: 'A$', label: 'AUD (A$)' },
];

const Register = ({ onSwitchToLogin }) => {
  const { register, theme, toggleTheme } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    monthlyBudget: '2500',
    currency: '$',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(
        formData.name,
        formData.email,
        formData.password,
        Number(formData.monthlyBudget) || 2000,
        formData.currency
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Theme Toggle Top Right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
          <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="auth-header">
          <div
            className="logo-badge"
            style={{ width: '50px', height: '50px', margin: '0 auto', borderRadius: '14px' }}
          >
            <Wallet size={26} />
          </div>
          <h1>Create Account</h1>
          <p>Start tracking your financial freedom</p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--color-expense-bg)',
              color: 'var(--text-main)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '0.88rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              id="register-name-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              id="register-email-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (6+ characters)</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              id="register-password-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Monthly Budget</label>
              <input
                type="number"
                className="form-input"
                placeholder="2500"
                value={formData.monthlyBudget}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                id="register-budget-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                id="register-currency-select"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '14px', padding: '12px' }}
            disabled={loading}
            id="btn-register-submit"
          >
            {loading ? 'Creating account...' : 'Complete Registration'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
            id="link-to-login"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
