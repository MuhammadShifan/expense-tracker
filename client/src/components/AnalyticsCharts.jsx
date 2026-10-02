import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsCharts = ({ categoryBreakdown = [], monthlyTrends = [], currency = '$' }) => {
  const { theme } = useAuth();
  const isDark = theme === 'dark';

  // Monochrome / Grayscale palette for category slices
  const categoryColorsDark = [
    '#ffffff', // Pure White
    '#e4e4e7', // Zinc 200
    '#d4d4d8', // Zinc 300
    '#a1a1aa', // Zinc 400
    '#71717a', // Zinc 500
    '#52525b', // Zinc 600
    '#3f3f46', // Zinc 700
    '#27272a', // Zinc 800
    '#18181b', // Zinc 900
  ];

  const categoryColorsLight = [
    '#000000', // Pure Black
    '#27272a', // Zinc 800
    '#3f3f46', // Zinc 700
    '#52525b', // Zinc 600
    '#71717a', // Zinc 500
    '#a1a1aa', // Zinc 400
    '#d4d4d8', // Zinc 300
    '#e4e4e7', // Zinc 200
    '#f4f4f5', // Zinc 100
  ];

  const categoryColors = isDark ? categoryColorsDark : categoryColorsLight;

  // Doughnut Chart Data
  const doughnutData = {
    labels: categoryBreakdown.length > 0 ? categoryBreakdown.map((c) => c.category) : ['No Expenses Yet'],
    datasets: [
      {
        data: categoryBreakdown.length > 0 ? categoryBreakdown.map((c) => c.total) : [1],
        backgroundColor: categoryBreakdown.length > 0 ? categoryColors.slice(0, categoryBreakdown.length) : [isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'],
        borderColor: isDark ? '#000000' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#a1a1aa' : '#52525b',
          font: { family: 'Inter', size: 11 },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (categoryBreakdown.length === 0) return ' No expense data';
            const value = context.raw || 0;
            return ` ${context.label}: ${currency}${value.toFixed(2)}`;
          },
        },
      },
    },
    cutout: '70%',
  };

  // Monthly Bar Chart Data (High Contrast Monochrome)
  const barData = {
    labels: monthlyTrends.map((m) => m.label),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrends.map((m) => m.income),
        backgroundColor: isDark ? '#ffffff' : '#000000',
        borderColor: isDark ? '#ffffff' : '#000000',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: monthlyTrends.map((m) => m.expense),
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#a1a1aa' : '#52525b',
          font: { family: 'Inter', size: 12, weight: 600 },
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${currency}${Number(context.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: isDark ? '#a1a1aa' : '#52525b', font: { family: 'Inter' } },
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
        ticks: {
          color: isDark ? '#a1a1aa' : '#52525b',
          font: { family: 'Inter' },
          callback: (value) => `${currency}${value}`,
        },
      },
    },
  };

  return (
    <div className="dashboard-grid">
      {/* Monthly Inflow vs Outflow Bar Chart */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <BarChart3 size={20} style={{ color: 'var(--text-main)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Income vs Expense Trends</h3>
        </div>
        <div style={{ height: '280px' }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Category Breakdown Doughnut Chart */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <PieIcon size={20} style={{ color: 'var(--text-main)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Expense by Category</h3>
        </div>
        <div style={{ height: '280px', position: 'relative' }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
