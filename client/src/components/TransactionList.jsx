import React from 'react';
import { Edit2, Trash2, Calendar, CreditCard, Inbox, Plus } from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Dining': '🍕',
  'Shopping': '🛍️',
  'Housing & Rent': '🏠',
  'Transportation': '🚗',
  'Utilities & Bills': '💡',
  'Entertainment': '🎬',
  'Healthcare': '💊',
  'Education': '🎓',
  'Salary': '💰',
  'Investment': '📈',
  'Freelance': '💻',
  'Gift & Grant': '🎁',
  'Business': '🏢',
  'Other': '📦',
};

const TransactionList = ({
  transactions = [],
  loading = false,
  currency = '$',
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card empty-state">
        <div className="empty-state-icon">
          <Inbox size={48} style={{ opacity: 0.4, margin: '0 auto' }} />
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No transactions found</h3>
        <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
          No records match your current filters. Start tracking your income and expenses today!
        </p>
        <button onClick={onOpenAddModal} className="btn btn-primary" id="btn-add-first-transaction">
          <Plus size={18} />
          <span>Add Your First Record</span>
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Transaction History</h3>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing {transactions.length} record{transactions.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="transactions-container">
        {transactions.map((item) => {
          const isIncome = item.type === 'income';
          const icon = CATEGORY_ICONS[item.category] || (isIncome ? '💰' : '💸');

          return (
            <div key={item._id} className="transaction-item">
              <div className="t-left">
                <div className="t-icon-box">
                  <span>{icon}</span>
                </div>

                <div className="t-meta">
                  <h4>{item.title}</h4>
                  <div className="t-subtitle">
                    <span className="category-tag">{item.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {formatDate(item.date)}
                    </span>
                    {item.paymentMethod && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CreditCard size={12} />
                        {item.paymentMethod}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="t-right">
                <div className={`t-amount ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                  {isIncome ? '+' : '-'}{currency}{formatAmount(item.amount)}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onEdit(item)}
                    className="btn-icon"
                    title="Edit transaction"
                    id={`btn-edit-${item._id}`}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="btn-icon"
                    title="Delete transaction"
                    id={`btn-delete-${item._id}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionList;
