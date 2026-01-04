export type TypeTache = 'formateur' | 'membre_jury' | 'beneficiaire_formation' | 'observateur' | 'concepteur_evaluation';

export type Specialite = 'pedagogique' | 'orientation' | 'planification' | 'services_financiers';

export type Grade = 'A' | 'B' | 'C';

export type DirectionAssociee = 'rabat_casa' | 'meknes_errachidia' | 'marrakech_agadir';

export interface TaskFormData {
  nom: string;
  description: string;
  typeTache: TypeTache;
  dateDebut: string;
  dateFin: string;
  remuneree: boolean;
  specialites: Specialite[];
  grades: Grade[];
  commune: boolean;
  necessiteVehicule: boolean;
  vehiculeId?: string;
  directionAssociee: DirectionAssociee;
  fichierJoint?: File;
  nombrePlaces: number;
  urgent: boolean;
  lieu?: string;
}

