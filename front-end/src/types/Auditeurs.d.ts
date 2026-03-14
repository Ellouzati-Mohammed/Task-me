export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  activeAuditors: number;
  inProgressTasks: number;
  assignedTasks: number;
  cancelledTasks: number;
  acceptanceRate: number;
}

export interface UseAuditeursOptions {
  mode?: 'auditeurs' | 'dashboard' | 'main-dashboard';
  user?: { id?: string } | null;
}
