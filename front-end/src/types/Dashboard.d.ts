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
  type: 'pending' | 'affectation' | 'affectee' | 'encours' | 'completed' | 'cancelled';
  user: string;
  task: string;
  time: string;
}
export type TaskStatus = 'pending' | 'affectation' | 'affectee' | 'encours' | 'completed' | 'cancelled';
export type TaskType = 'formateur' | 'membre_jury' | 'beneficiaire_formation' | 'observateur' | 'concepteur_evaluation';

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
  affectation: { label: string; className: string };
  affectee: { label: string; className: string };
  encours: { label: string; className: string };
  completed: { label: string; className: string };
  cancelled: { label: string; className: string };
}
export interface TypeLabels {
  formateur: string;
  membre_jury: string;
  beneficiaire_formation: string;
  observateur: string;
  concepteur_evaluation: string;
}