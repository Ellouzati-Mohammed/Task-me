export type UserRole = 'superadmin' | 'admin' | 'coordinateur' | 'auditeur' | 'planification' | 'formateur';
export type UserGrade = 'A' | 'B' | 'C';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  grade: UserGrade;
  hireDate: string;
  status: UserStatus;
  avatar?: string;
}

export interface RoleConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}
