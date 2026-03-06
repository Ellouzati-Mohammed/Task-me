import type { UserRole } from './User';

export interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  grade?: string;
  specialite?: string;
  formation?: string;
  diplomes?: string;
  actif?: boolean;
  dateembauche?: Date;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, motdePasse: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}
