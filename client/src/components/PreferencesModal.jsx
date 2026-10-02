import React, { useState, useEffect } from 'react';
import { X, Target, Coins, Sliders, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const POPULAR_CURRENCIES = [
  { symbol: '$', label: 'USD ($)', name: 'US Dollar' },
  { symbol: '₹', label: 'INR (₹)', name: 'Indian Rupee' },
  { symbol: '€', label: 'EUR (€)', name: 'Euro' },
  { symbol: '£', label: 'GBP (£)', name: 'British Pound' },
  { symbol: '¥', label: 'JPY (¥)', name: 'Yen / Yuan' },
  { symbol: 'C$', label: 'CAD (C$)', name: 'Canadian Dollar' },
  { symbol: 'A$', label: 'AUD (A$)', name: 'Australian Dollar' },
  { symbol: 'AED', label: 'AED', name: 'UAE Dirham' },
  { symbol: 'CHF', label: 'CHF', name: 'Swiss Franc' },
  { symbol: '₩', label: 'KRW (₩)', name: 'South Korean Won' },
];

const BUDGET_PRESETS = [1000, 2000, 3500, 5000, 10000];

const PreferencesModal = ({ isOpen, onClose, onUpdated }) => {
  const { user, updateUser } = useAuth();
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [currency, setCurrency] = useState('$');
  const [customCurrency, setCustomCurrency] = useState('');
  const [isCustomCurrency, setIsCustomCurrency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setMonthlyBudget(user.monthlyBudget !== undefined ? String(user.monthlyBudget) : '2000');
      const userCurr = user.currency || '$';
      const isKnown = POPULAR_CURRENCIES.some((c) => c.symbol === userCurr);
      if (isKnown) {
        setCurrency(userCurr);
        setIsCustomCurrency(false);
        setCustomCurrency('');
      } else {
        setCurrency('CUSTOM');
        setIsCustomCurrency(true);
        setCustomCurrency(userCurr);
      }
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCurrencySelect = (sym) => {
    if (sym === 'CUSTOM') {
      setIsCustomCurrency(true);
      setCurrency('CUSTOM');
    } else {
      setIsCustomCurrency(false);
      setCurrency(sym);
      setCustomCurrency('');
    }
  };

  const activeCurrencySymbol = isCustomCurrency ? (customCurrency || '$') : currency;
  const budgetNum = Number(monthlyBudget) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalBudget = Number(monthlyBudget);
    if (!monthlyBudget || isNaN(finalBudget) || finalBudget <= 0) {
      setError('Please enter a valid monthly budget limit greater than 0');
      return;
    }

    const finalCurrency = isCustomCurrency ? customCurrency.trim() : currency;
    if (!finalCurrency) {
      setError('Please provide or select a currency symbol');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authService.updateProfile({
        monthlyBudget: finalBudget,
        currency: finalCurrency,
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setSuccessMsg('Preferences updated successfully!');
        if (onUpdated) {
          await onUpdated(res.data.user);
        }
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card preferences-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Update Preferences</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Manage your monthly velocity limit and currency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            title="Close modal"
            id="btn-close-preferences-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div
              style={{
                background: 'var(--color-expense-bg)',
                color: 'var(--text-main)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.85rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: 'var(--color-income-bg)',
                color: 'var(--text-main)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.85rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="preferences-preview-card">
            <div className="preview-label">
              <Sparkles size={14} />
              <span>Live Dashboard Preview</span>
            </div>
            <div className="preview-content">
              <div className="preview-stat">
                <span className="stat-title">Monthly Limit</span>
                <span className="stat-value">
                  {activeCurrencySymbol}{formatAmount(budgetNum)}
                </span>
              </div>
              <div className="preview-divider" />
              <div className="preview-stat">
                <span className="stat-title">Example Entry</span>
                <span className="stat-value">
                  {activeCurrencySymbol}250.00
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Budget Input */}
          <div className="form-group" style={{ marginTop: '18px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={15} />
              <span>Monthly Budget Velocity Limit ({activeCurrencySymbol})</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                }}
              >
                {activeCurrencySymbol}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                className="form-input"
                style={{ paddingLeft: `${Math.max(34, (activeCurrencySymbol.length * 10) + 24)}px` }}
                placeholder="2000"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                required
                id="input-preferences-budget"
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Used to track spending velocity, progress bars, and limit warnings on the dashboard.
            </span>

            {/* Quick Budget Presets */}
            <div className="budget-preset-group">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-chip ${Number(monthlyBudget) === preset ? 'active' : ''}`}
                  onClick={() => setMonthlyBudget(String(preset))}
                >
                  {activeCurrencySymbol}{formatAmount(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Symbol Selection */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', }}>
              <Coins size={15} />
              <span>Currency Symbol</span>
            </label>

            {/* Popular Currency Chips */}
            <div className="currency-chip-grid">
              {POPULAR_CURRENCIES.map((curr) => {
                const isSelected = !isCustomCurrency && currency === curr.symbol;
                return (
                  <button
                    key={curr.symbol}
                    type="button"
                    className={`currency-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => handleCurrencySelect(curr.symbol)}
                    id={`btn-curr-${curr.symbol}`}
                  >
                    <span className="currency-symbol">{curr.symbol}</span>
                    <span className="currency-name">{curr.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className={`currency-chip ${isCustomCurrency ? 'active' : ''}`}
                onClick={() => handleCurrencySelect('CUSTOM')}
                id="btn-curr-custom"
              >
                <span className="currency-symbol">✎</span>
                <span className="currency-name">Custom</span>
              </button>
            </div>

            {/* Custom Currency Text Input if Custom selected */}
            {isCustomCurrency && (
              <div style={{ marginTop: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Custom Currency Symbol or Code
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. zł, kr, ₱, BTC, CHF"
                  maxLength={6}
                  value={customCurrency}
                  onChange={(e) => setCustomCurrency(e.target.value)}
                  required
                  id="input-preferences-custom-currency"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              id="btn-cancel-preferences"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
              id="btn-save-preferences"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesModal;
