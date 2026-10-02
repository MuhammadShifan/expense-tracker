import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const CATEGORIES_EXPENSE = [
  'Food & Dining',
  'Shopping',
  'Housing & Rent',
  'Transportation',
  'Utilities & Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

const CATEGORIES_INCOME = [
  'Salary',
  'Investment',
  'Freelance',
  'Gift & Grant',
  'Business',
  'Other',
];

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'UPI', 'Other'];

const TransactionFormModal = ({ isOpen, onClose, onSave, editingTransaction, currency = '$' }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title || '',
        amount: editingTransaction.amount || '',
        type: editingTransaction.type || 'expense',
        category: editingTransaction.category || 'Food & Dining',
        date: editingTransaction.date
          ? new Date(editingTransaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        paymentMethod: editingTransaction.paymentMethod || 'Credit Card',
        notes: editingTransaction.notes || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card',
        notes: '',
      });
    }
    setError('');
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: newType === 'expense' ? CATEGORIES_EXPENSE[0] : CATEGORIES_INCOME[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a title');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = formData.type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {editingTransaction ? '✏️ Edit Transaction' : '✨ Add New Transaction'}
          </h3>
          <button onClick={onClose} className="btn-icon" id="btn-close-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ background: 'var(--color-expense-bg)', color: 'var(--text-main)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.85rem', border: '1px solid var(--border-subtle)' }}>
              {error}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="type-toggle-group">
            <button
              type="button"
              className={`type-toggle-btn ${formData.type === 'expense' ? 'active-expense' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              <ArrowDownCircle size={18} />
              <span>Expense</span>
            </button>
            <button
              type="button"
              className={`type-toggle-btn ${formData.type === 'income' ? 'active-income' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              <ArrowUpCircle size={18} />
              <span>Income</span>
            </button>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title / Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Grocery store, AWS bill, Monthly salary"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              id="input-transaction-title"
            />
          </div>

          {/* Amount & Date in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                id="input-transaction-amount"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                id="input-transaction-date"
              />
            </div>
          </div>

          {/* Category & Payment Method in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                id="select-transaction-category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                id="select-transaction-method"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Add optional context or receipt details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              id="input-transaction-notes"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
            id="btn-submit-transaction"
          >
            {loading ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Record Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;
