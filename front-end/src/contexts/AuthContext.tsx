/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/UserForm.d';

export interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

// Mock data pour l'utilisateur connecté
const mockUser: AuthUser = {
  id: '1',
  nom: 'Alami',
  prenom: 'Mohammed',
  email: 'mohammed.alami@taskme.ma',
  role: 'auditeur'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(mockUser);

  const login = (userData: AuthUser) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
