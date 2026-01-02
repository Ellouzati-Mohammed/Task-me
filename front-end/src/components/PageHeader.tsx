import { 
  Search,
  SlidersHorizontal,
  List,
  Grid,
  Plus
} from 'lucide-react';
import '../Styles/PageHeader.css';

import type {PageHeaderProps} from "../types/PageHeader"
export function PageHeader({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  filters,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onNewClick,
  newButtonText = 'Nouveau',
  resultsCount,
  getFilterCount
}: PageHeaderProps) {
  return (
    <>
      <div className="page-header-section">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-search-box">
          <Search className="page-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="page-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="page-toolbar-actions">
          <button className="page-toolbar-icon-button" title="Filtres">
            <SlidersHorizontal size={16} />
          </button>
          {viewMode && onViewModeChange && (
            <div className="page-view-mode-toggle">
              <button 
                className={`page-view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => onViewModeChange('list')}
              >
                <List size={16} />
              </button>
              <button 
                className={`page-view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => onViewModeChange('grid')}
              >
                <Grid size={16} />
              </button>
            </div>
          )}
          {onNewClick && (
            <button className="page-new-btn" onClick={onNewClick}>
              <Plus size={16} />
              {newButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Status Filters */}
      <div className="page-status-badges">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`page-status-badge ${activeFilter === filter.value ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.value)}
          >
            {filter.label}
            {filter.value !== 'all' && getFilterCount && (
              <span className="page-status-badge-count">
                {getFilterCount(filter.value)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="page-results-count">
        {resultsCount} résultat{resultsCount > 1 ? 's' : ''} trouvé{resultsCount > 1 ? 's' : ''}
      </p>
    </>
  );
}
