import React from 'react';
import { Wallet, Sun, Moon, LogOut, Plus, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenAddModal, onOpenPreferences }) => {
  const { user, logout, theme, toggleTheme } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="brand-logo">
          <div className="logo-badge">
            <Wallet size={22} />
          </div>
          <div>
            <span>E-</span>
            <span className="brand-highlight">Tracker</span>
          </div>
        </div>

        {/* User & Actions */}
        <div className="navbar-actions">
          {user && (
            <button
              onClick={onOpenAddModal}
              className="btn btn-primary"
              id="btn-add-transaction-nav"
            >
              <Plus size={18} />
              <span>Add Transaction</span>
            </button>
          )}

          {/* Preferences / Settings */}
          {user && onOpenPreferences && (
            <button
              onClick={onOpenPreferences}
              className="btn-icon"
              title="Preferences & Settings"
              id="btn-preferences-nav"
            >
              <Settings size={19} />
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <>
              <div className="user-pill">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name}</span>
              </div>

              <button
                onClick={logout}
                className="btn btn-secondary"
                title="Log out"
                id="logout-btn"
                style={{ padding: '8px 12px' }}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
