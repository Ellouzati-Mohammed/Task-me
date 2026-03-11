import { useState, useEffect } from 'react';
import api from '../services/api';
import type { UserFormData, UserGrade, UserFormModalProps } from '../types/UserForm.d';
import type { User } from '../types/User.d';

const initialFormData: UserFormData = {
  nom: '',
  prenom: '',
  email: '',
  motdePasse: '',
  role: 'auditeur',
  grade: '' as UserGrade,
  specialite: '',
  diplomes: '',
  formations: [],
  actif: true,
  dateInscription: new Date().toISOString().split('T')[0],
};

function getInitialData(user: UserFormModalProps['user'], userType: 'coordinateur' | 'auditeur'): UserFormData {
  if (user) {
    return {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      motdePasse: user.motdePasse || '',
      role: user.role,
      grade: (user.grade || '') as UserGrade,
      specialite: user.specialite || '',
      diplomes: user.diplomes || '',
      formations: [],
      actif: user.actif,
      dateInscription: user.dateembauche
        ? new Date(user.dateembauche).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    };
  }
  return { ...initialFormData, role: userType };
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    err.response.data &&
    typeof err.response.data === 'object' &&
    'message' in err.response.data
  ) {
    return String((err.response.data as { message: unknown }).message);
  }
  return fallback;
}

export function useUserForm({ onClose, user, mode = 'create' }: UserFormModalProps) {
  const [userType, setUserType] = useState<'coordinateur' | 'auditeur'>(
    user?.role === 'coordinateur' ? 'coordinateur' : 'auditeur'
  );
  const [formData, setFormData] = useState<UserFormData>(() => getInitialData(user, userType));
  const [error, setError] = useState<string>('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const updateField = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUserTypeChange = (newType: 'coordinateur' | 'auditeur') => {
    setUserType(newType);
    setFormData((prev) => ({ ...prev, role: newType }));
  };

  const addUser = async (): Promise<boolean> => {
    try {
      setError('');
      const dataToSend: Partial<User> & { formation?: string } = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motdePasse: formData.motdePasse,
        role: formData.role,
        actif: formData.actif,
        dateembauche: formData.dateInscription,
      };

      if (formData.role === 'auditeur') {
        dataToSend.grade = formData.grade || undefined;
        dataToSend.specialite = formData.specialite;
        dataToSend.diplomes = formData.diplomes || '';
        dataToSend.formation = Array.isArray(formData.formations)
          ? formData.formations.join(', ')
          : formData.formations || '';
      }

      await api.post('/users/', dataToSend);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Erreur lors de la création de l'utilisateur"));
      return false;
    }
  };

  const updateUser = async (): Promise<boolean> => {
    try {
      setError('');
      const dataToSend: Partial<User> = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
        actif: formData.actif,
        dateembauche: formData.dateInscription,
      };

      if (formData.motdePasse) dataToSend.motdePasse = formData.motdePasse;

      if (formData.role === 'auditeur') {
        dataToSend.grade = formData.grade || undefined;
        dataToSend.specialite = formData.specialite;
        dataToSend.diplomes = formData.diplomes || '';
        dataToSend.formation = Array.isArray(formData.formations)
          ? formData.formations.join(', ')
          : formData.formations || '';
      }

      await api.put(`/users/${user?._id}`, dataToSend);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Erreur lors de la modification de l'utilisateur"));
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = mode === 'create' ? await addUser() : await updateUser();
    if (success) onClose();
  };

  return {
    userType,
    formData,
    error,
    updateField,
    handleUserTypeChange,
    handleSubmit,
  };
}
