import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const { login, theme, toggleTheme } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@etracker.dev');
    setPassword('demo1234');
  };

  // Google Login redirect function (Puthusa add pannathu)
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
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
          <h1>Welcome Back</h1>
          <p>Sign in to your intelligent expense dashboard</p>
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
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="login-email-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            disabled={loading}
            id="btn-login-submit"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>

          {/* Quick Demo Credentials */}
          <button
            type="button"
            onClick={handleDemoFill}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '10px', padding: '9px', fontSize: '0.82rem' }}
          >
            <Sparkles size={14} />
            <span>Use Demo Account</span>
          </button>
        </form>

        {/* --- Puthusa Add panna Google Section --- */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', opacity: 0.5 }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle, #444)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.8rem', color: 'var(--text-main, #fff)' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle, #444)' }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontWeight: '600',
            padding: '11px',
            borderRadius: '8px',
            cursor: 'pointer',
            border: 'none',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        {/* ---------------------------------------- */}

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          Don't have an account yet?{' '}
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToRegister();
            }}
            id="link-to-register"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;