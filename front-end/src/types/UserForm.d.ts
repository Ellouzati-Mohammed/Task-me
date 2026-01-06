export type UserRole = 'admin' | 'coordinateur' | 'auditeur';
export type UserGrade = ''|'A' | 'B' | 'C';
export type Specialite = ''|'pedagogique' | 'orientation' | 'planification' | 'services_financiers';

export interface UserFormData {
  nom: string;
  prenom: string;
  email: string;
  motdePasse?: string;
  role: UserRole;
  grade: UserGrade;
  specialite?: Specialite | string;
  diplomes?: string;
  formations?: string[];
  actif: boolean;
  dateInscription: string;
  avatar?: File;
}

export interface UserFormModalProps {
  onClose: () => void;
  user?: {
    _id?: string;
    nom: string;
    prenom: string;
    email: string;
    motdePasse?: string;
    role: UserRole;
    specialite?: string;
    grade?: UserGrade;
    dateembauche?: string;
    actif: boolean;
    diplomes?: string;
    formation?: string;
  };
  mode?: 'create' | 'edit';
}
