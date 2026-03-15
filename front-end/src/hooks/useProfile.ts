import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { PasswordChange, UserProfile } from '../types/Profile.d';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        if (response.data.success) {
          const userData = response.data.user;
          setProfile({
            id: userData.id,
            firstName: userData.prenom,
            lastName: userData.nom,
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role,
            grade: userData.grade,
            hireDate: userData.dateembauche || '',
          });
        }
      } catch (err) {
        console.error('Erreur recuperation profil:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => setIsEditing(false);

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const updateData = {
        prenom: profile.firstName,
        nom: profile.lastName,
        email: profile.email,
        phone: profile.phone,
      };

      const response = await api.put('/users/profile/me', updateData);
      if (response.data.success) {
        setIsEditing(false);
        alert('Profil mis a jour avec succes');
      }
    } catch (err) {
      console.error('Erreur mise a jour profil:', err);
      alert('Erreur lors de la mise a jour du profil');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await api.put('/users/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        alert('Mot de passe modifie avec succes');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('Erreur changement mot de passe:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(errorMessage || 'Erreur lors du changement de mot de passe');
    }
  };

  return {
    user,
    profile,
    activeTab,
    setActiveTab,
    isEditing,
    loading,
    error,
    passwordData,
    setPasswordData,
    startEditing,
    cancelEditing,
    handleProfileChange,
    handleSaveProfile,
    handlePasswordChange,
  };
}
