/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/UserForm.d';
import api from '../services/api';

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

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, motdePasse: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  token: null
});

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer le token depuis le localStorage au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Configurer le header Authorization pour toutes les requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    // Marquer le chargement comme terminé
    setIsLoading(false);
  }, []);

  const login = async (email: string, motdePasse: string) => {
    try {
      const response = await api.post('/auth/login', { email, motdePasse });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Sauvegarder le token et l'utilisateur
        setToken(newToken);
        setUser(userData);
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Configurer le header Authorization
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } else {
        throw new Error(response.data.message || 'Erreur de connexion');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isLoading,
        login, 
        logout,
        token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
