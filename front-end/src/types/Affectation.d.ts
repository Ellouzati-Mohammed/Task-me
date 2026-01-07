export type AffectationStatus = 'PROPOSEE' | 'ACCEPTEE' | 'REFUSEE' | 'DELEGUEE';

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
