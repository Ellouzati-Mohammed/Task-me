import type { LucideIcon } from 'lucide-react';

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

// Tâche brute depuis l'API (champ _id MongoDB)
export interface TaskDetail {
  _id: string;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  directionAssociee?: string;
  nombrePlaces: number;
  typeTache: string;
  statutTache: string;
  fichierJoint?: string;
}

export interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

export interface RecentAffectation {
  id: string;
  userName: string;
  taskName: string;
  status: 'PROPOSEE' | 'ACCEPTEE' | 'REFUSEE' | 'DELEGUEE';
  date: string;
}

export interface TaskWithTimestamp extends Task {
  createdAt: string;
}

export interface ApiAffectation {
  _id: string;
  auditeur?: {
    prenom: string;
    nom: string;
  };
  tache?: {
    nom: string;
  };
  statutAffectation: 'PROPOSEE' | 'ACCEPTEE' | 'REFUSEE' | 'DELEGUEE';
  updatedAt?: string;
  createdAt?: string;
}

export interface AuditorStats {
  totalAffectations: number;
  acceptedTasks: number;
  refusedTasks: number;
  delegatedTasks: number;
  pendingTasks: number;
  completedTasks: number;
}

export interface AffectationWithTask {
  _id: string;
  tache: {
    nom: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    directionAssociee: string;
    remuneree: boolean;
  };
  statutAffectation: string;
  dateAffectation: string;
}