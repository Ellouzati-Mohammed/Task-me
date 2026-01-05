export type UserRole = 'admin' | 'coordinateur' | 'auditeur';
export type UserGrade = 'A' | 'B' | 'C';
export type Specialite = 'pedagogique' | 'orientation' | 'planification' | 'services_financiers';

export interface UserFormData {
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  role: UserRole;
  grade: UserGrade;
  specialite: Specialite;
  diplomes: string[];
  formations: string[];
  actif: boolean;
  dateInscription: string;
  avatar?: File;
}

export interface UserFormModalProps {
  onClose: () => void;
  user?: UserFormData & { id?: string };
  mode?: 'create' | 'edit';
}
