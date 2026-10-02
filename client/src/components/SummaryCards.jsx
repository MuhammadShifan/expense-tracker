import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const SummaryCards = ({ summary, currency: propCurrency }) => {
  const currency = propCurrency || summary?.currency || '$';
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const netBalance = summary?.netBalance || 0;
  const savingsRate = summary?.savingsRate || 0;

  const formatAmount = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="summary-grid">
      {/* Total Balance Card */}
      <div className="glass-card summary-card">
        <div className="summary-info">
          <h3>Total Balance</h3>
          <div className="summary-value">
            {currency}{formatAmount(netBalance)}
          </div>
          <div className="summary-subtext">
            {netBalance >= 0 ? '✨ Net positive balance' : '⚠️ Net negative balance'}
          </div>
        </div>
        <div className="summary-icon-box icon-box-balance">
          <DollarSign size={24} />
        </div>
      </div>

      {/* Total Income Card */}
      <div className="glass-card summary-card">
        <div className="summary-info">
          <h3>Total Income</h3>
          <div className="summary-value">
            +{currency}{formatAmount(totalIncome)}
          </div>
          <div className="summary-subtext">All revenue streams</div>
        </div>
        <div className="summary-icon-box icon-box-income">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="glass-card summary-card">
        <div className="summary-info">
          <h3>Total Expenses</h3>
          <div className="summary-value" style={{ color: 'var(--text-secondary)' }}>
            -{currency}{formatAmount(totalExpense)}
          </div>
          <div className="summary-subtext">Total tracked outflows</div>
        </div>
        <div className="summary-icon-box icon-box-expense">
          <TrendingDown size={24} />
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="glass-card summary-card">
        <div className="summary-info">
          <h3>Savings Rate</h3>
          <div className="summary-value">
            {savingsRate}%
          </div>
          <div className="summary-subtext">
            {savingsRate >= 20 ? 'Target achieved (20%+)' : 'Target: 20%+ recommended'}
          </div>
        </div>
        <div className="summary-icon-box icon-box-savings">
          <Activity size={24} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
