export 
interface Filter {
  value: string;
  label: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: Filter[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  onNewClick?: () => void;
  newButtonText?: string;
  resultsCount: number;
  getFilterCount?: (filterValue: string) => number;
}
