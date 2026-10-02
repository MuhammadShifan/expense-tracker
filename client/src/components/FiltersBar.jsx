import React from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Food & Dining',
  'Shopping',
  'Housing & Rent',
  'Transportation',
  'Utilities & Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Salary',
  'Investment',
  'Freelance',
  'Gift & Grant',
  'Other',
];

const FiltersBar = ({
  search,
  setSearch,
  category,
  setCategory,
  type,
  setType,
  onResetFilters,
  onExportCSV,
  onExportJSON,
}) => {
  return (
    <div className="glass-card toolbar-card">
      {/* Search Input */}
      <div className="search-group">
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, notes, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-transactions-input"
        />
      </div>

      {/* Filter Controls */}
      <div className="filter-group">
        {/* Category Filter */}
        <select
          className="select-custom"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          id="filter-category-select"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? '📂 All Categories' : cat}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          className="select-custom"
          value={type}
          onChange={(e) => setType(e.target.value)}
          id="filter-type-select"
        >
          <option value="All">💳 All Types</option>
          <option value="expense">🔻 Expenses Only</option>
          <option value="income">🟢 Income Only</option>
        </select>

        {/* Reset Filter Button */}
        {(search || category !== 'All' || type !== 'All') && (
          <button
            onClick={onResetFilters}
            className="btn btn-secondary"
            title="Reset Filters"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={14} />
          </button>
        )}

        {/* Export CSV */}
        <button
          onClick={onExportCSV}
          className="btn btn-secondary"
          title="Export CSV"
          id="export-csv-btn"
          style={{ padding: '8px 12px' }}
        >
          <Download size={15} />
          <span>CSV</span>
        </button>

        {/* Export JSON */}
        <button
          onClick={onExportJSON}
          className="btn btn-secondary"
          title="Export JSON"
          id="export-json-btn"
          style={{ padding: '8px 12px' }}
        >
          <Download size={15} />
          <span>JSON</span>
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;
