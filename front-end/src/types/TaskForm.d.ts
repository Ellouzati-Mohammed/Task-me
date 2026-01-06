export type TypeTache = 'Formateur' | 'Membre de Jury' | 'Bénéficiaire de formation' | 'Observateur' | 'Concepteur';

export type StatutTache = 'CREEE' | 'EN_AFFECTATION' | 'COMPLETEE_AFFECTEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export type Specialite = string;

export type Grade = string;

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
  specialites: Specialite[];
  grades: Grade[];
  necessiteVehicule: boolean;
  vehiculeId?: string;
  directionAssociee: DirectionAssociee;
  fichierJoint?: File;
  nombrePlaces: number;
  urgent: boolean;
}

export interface TaskFormModalProps {
  onClose: () => void;
  task?: TaskFormData & { id?: string };
  mode?: 'create' | 'edit';
}

