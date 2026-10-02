import React from 'react';
import { Target, AlertTriangle, CheckCircle, Pencil } from 'lucide-react';

const BudgetProgress = ({ budget, currency = '$', onOpenEdit }) => {
  if (!budget) return null;

  const {
    monthlyBudget = 2000,
    currentMonthExpense = 0,
    budgetUsedPercentage = 0,
    isOverBudget = false,
    remainingBudget = 0,
  } = budget;

  const formatAmount = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  let fillClass = 'fill-safe';
  if (budgetUsedPercentage >= 90 || isOverBudget) {
    fillClass = 'fill-danger';
  } else if (budgetUsedPercentage >= 70) {
    fillClass = 'fill-warning';
  }

  return (
    <div className="glass-card budget-card">
      <div className="budget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} style={{ color: 'var(--text-main)' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Monthly Budget Velocity</h4>
          {onOpenEdit && (
            <button
              onClick={onOpenEdit}
              className="btn-icon"
              title="Edit monthly budget & currency"
              id="btn-edit-budget-velocity"
              style={{
                width: '26px',
                height: '26px',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isOverBudget ? 'var(--text-main)' : 'var(--text-secondary)' }}>
          {currency}{formatAmount(currentMonthExpense)} / {currency}{formatAmount(monthlyBudget)} ({budgetUsedPercentage}%)
        </div>
      </div>

      <div className="progress-track">
        <div
          className={`progress-fill ${fillClass}`}
          style={{ width: `${Math.min(100, budgetUsedPercentage)}%` }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem' }}>
        {isOverBudget ? (
          <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <AlertTriangle size={14} /> Exceeded monthly limit by {currency}{formatAmount(currentMonthExpense - monthlyBudget)}
          </span>
        ) : (
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> {currency}{formatAmount(remainingBudget)} remaining for this month
          </span>
        )}
        <span style={{ color: 'var(--text-muted)' }}>Auto-resets on the 1st</span>
      </div>
    </div>
  );
};

export default BudgetProgress;
