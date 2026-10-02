import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/api';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import BudgetProgress from '../components/BudgetProgress';
import AnalyticsCharts from '../components/AnalyticsCharts';
import FiltersBar from '../components/FiltersBar';
import TransactionList from '../components/TransactionList';
import TransactionFormModal from '../components/TransactionFormModal';
import PreferencesModal from '../components/PreferencesModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // Fetch Dashboard Summary Analytics
  const fetchSummary = useCallback(async () => {
    try {
      const res = await transactionService.getSummary();
      if (res.data.success) {
        setSummaryData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, []);

  // Fetch Filtered Transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (type !== 'All') params.type = type;

      const res = await transactionService.getAll(params);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, type]);

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, [fetchSummary, fetchTransactions]);

  // Handle Save Transaction (Create or Update)
  const handleSaveTransaction = async (formData) => {
    if (editingTransaction) {
      await transactionService.update(editingTransaction._id, formData);
    } else {
      await transactionService.create(formData);
    }
    fetchSummary();
    fetchTransactions();
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.delete(id);
        fetchSummary();
        fetchTransactions();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  // Open modal for editing
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Open modal for adding
  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setType('All');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'PaymentMethod', 'Notes'];
    const rows = transactions.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${t.category}"`,
      new Date(t.date).toISOString().split('T')[0],
      `"${t.paymentMethod || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `etracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (transactions.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `etracker_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currency = user?.currency || summaryData?.summary?.currency || '$';

  return (
    <div className="app-container">
      <Navbar
        onOpenAddModal={handleAddClick}
        onOpenPreferences={() => setIsPreferencesModalOpen(true)}
      />

      <main className="main-content">
        {/* Top Metric Cards */}
        <SummaryCards summary={summaryData?.summary} currency={currency} />

        {/* Monthly Budget Velocity Bar */}
        <BudgetProgress
          budget={summaryData?.budget}
          currency={currency}
          onOpenEdit={() => setIsPreferencesModalOpen(true)}
        />

        {/* Charts: Trends & Category Breakdown */}
        <AnalyticsCharts
          categoryBreakdown={summaryData?.categoryBreakdown || []}
          monthlyTrends={summaryData?.monthlyTrends || []}
          currency={currency}
        />

        {/* Toolbar & Filters */}
        <FiltersBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          type={type}
          setType={setType}
          onResetFilters={handleResetFilters}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />

        {/* Transaction History Feed */}
        <TransactionList
          transactions={transactions}
          loading={loading}
          currency={currency}
          onEdit={handleEditClick}
          onDelete={handleDeleteTransaction}
          onOpenAddModal={handleAddClick}
        />
      </main>

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currency={currency}
      />

      {/* Update Preferences Modal (Budget Limit & Currency) */}
      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        onUpdated={fetchSummary}
      />
    </div>
  );
};

export default Dashboard;
