export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}
export interface ActivityItem {
  id: string;
  type: 'accepted' | 'refused' | 'delegated' | 'created' | 'assigned';
  user: string;
  task: string;
  time: string;
}
type TaskStatus = 'pending' | 'accepted' | 'refused' | 'delegated' | 'completed';
type TaskType = 'formateur' | 'membre_jury' | 'beneficiaire_formation' | 'observateur' | 'concepteur_evaluation';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  type: TaskType;
  startDate: string;
  endDate: string;
  direction?: string;
  placesCount: number;
  isRemunerated: boolean;
}

export interface StatusConfig {
  pending: { label: string; className: string };
  accepted: { label: string; className: string };
  refused: { label: string; className: string };
  delegated: { label: string; className: string };
  completed: { label: string; className: string };
}
export interface TypeLabels {
  formateur: string;
  membre_jury: string;
  beneficiaire_formation: string;
  observateur: string;
  concepteur_evaluation: string;
}