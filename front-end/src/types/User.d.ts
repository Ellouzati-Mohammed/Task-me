export type UserRole =  'admin' | 'coordinateur' | 'auditeur';
export type UserGrade = 'A' | 'B' | 'C';
export type UserStatus = 'active' | 'inactive';

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  motdePasse: string;
  role: UserRole;
  specialite: string;
  grade?: UserGrade;
  dateembauche: string;
  actif: boolean;
  diplomes?: string;
  formation?: string;
}

export interface RoleConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

export interface Auditeur {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  grade?: string;
  specialite?: string;
  formation?: string;
  diplomes?: string;
  actif: boolean;
  dateembauche?: string;
}
