export type TypeTache = 'Formateur' | 'Membre de Jury' | 'Bénéficiaire de formation' | 'Observateur' | 'Concepteur';

export type StatutTache = 'Ouverte' | 'Acceptée' | 'Refusée' | 'Déléguée' | 'En cours' | 'Terminée' | 'Annulée';

export type DirectionAssociee = 'Rabat-Casa' | 'Meknès-Errachidia' | 'Marrakech-Agadir';

export interface TaskFormData {
  nom: string;
  description: string;
  typeTache: TypeTache;
  statutTache: StatutTache;
  dateDebut: string;
  dateFin: string;
  dateCreation: string;
  remuneree: boolean;
  specialites: string[];
  grades: string[];
  commune: boolean;
  necessiteVehicule: boolean;
  vehicule?: string;
  directionAssociee?: DirectionAssociee;
  fichierJoint: string;
  nombrePlaces: number;
  urgent: boolean;
  coordinateur?: string;
  conversation?: string;
}

export interface TaskFormModalProps {
  onClose: () => void;
  task?: TaskFormData & { id?: string };
  mode?: 'create' | 'edit';
}

