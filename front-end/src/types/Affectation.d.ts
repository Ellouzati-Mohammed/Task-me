export type AffectationStatus = 'PROPOSEE' | 'ACCEPTEE' | 'REFUSEE' | 'DELEGUEE';

// Affectation avec auditeur populé (réponse API détaillée)
export interface AffectationDetail {
  _id: string;
  statutAffectation: string;
  auditeur: {
    _id: string;
    prenom: string;
    nom: string;
    email: string;
    specialite: string;
    grade: string;
  };
  dateAffectation: string;
  modeAffectation: string;
  justificatif?: string;
  rapportIA?: string;
}

export interface AffectationModalProps {
  taskId: string;
  taskName?: string;
  maxPlaces?: number;
  onClose: () => void;
}

export interface DelegateModalProps {
  affectationId: string;
  taskName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export interface RefuseModalProps {
  affectationId: string;
  taskName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export interface UseRefuseModalOptions {
  affectationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export interface Affectation {
  _id: string;
  tache: {
    _id: string;
    nom: string;
    description: string;
    typeTache: string;
    statutTache?: string;
    dateDebut: string;
    dateFin: string;
    directionAssociee?: string;
    nombrePlaces: number;
    remuneree: boolean;
    fichierJoint?: string;
  };
  auditeur: string;
  modeAffectation: 'MANUEL' | 'AUTOMATIQUE';
  statutAffectation: AffectationStatus;
  dateAffectation: string;
}

export type MyTaskStatus = 'pending' | 'accepted' | 'refused' | 'delegated' | 'completed';

export interface MyTaskStatusConfig {
  pending: { label: string; className: string };
  accepted: { label: string; className: string };
  refused: { label: string; className: string };
  delegated: { label: string; className: string };
  completed: { label: string; className: string };
}
