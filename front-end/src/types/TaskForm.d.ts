export type TypeTache = 'formateur' | 'membre_jury' | 'beneficiaire_formation' | 'observateur' | 'concepteur_evaluation';

export type StatutTache = 'creee' | 'en_affectation' | 'completee_affectee' | 'en_cours' | 'terminee' | 'annulee';

export type Specialite = 'pedagogique' | 'orientation' | 'planification' | 'services_financiers';

export type Grade = 'A' | 'B' | 'C';

export type DirectionAssociee = 'rabat_casa' | 'meknes_errachidia' | 'marrakech_agadir';

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

