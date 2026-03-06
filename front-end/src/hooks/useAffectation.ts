import { useState, useEffect } from 'react';
import api from '../services/api';
import type { User } from '../types/User.d';

export function useAffectation(taskId: string, maxPlaces: number) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [existingAffectationsCount, setExistingAffectationsCount] = useState(0);
  const [validAffectationsCount, setValidAffectationsCount] = useState(0);
  const [affectMode, setAffectMode] = useState<'MANUEL' | 'SEMI_AUTOMATISE' | 'AUTOMATISE_IA'>('MANUEL');
  const [iaReports, setIaReports] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersResponse = await api.get('/users/auditeurs/list');
        setUsers(usersResponse.data.data || usersResponse.data);

        const affectationsResponse = await api.get(`/affectations?tache=${taskId}`);
        const affectations = affectationsResponse.data.data || affectationsResponse.data;
        setExistingAffectationsCount(affectations.length);

        const validAffectations = affectations.filter((aff: { statutAffectation: string }) =>
          ['PROPOSEE', 'ACCEPTEE', 'DELEGUEE'].includes(aff.statutAffectation)
        );
        setValidAffectationsCount(validAffectations.length);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        alert('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [taskId]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) return prev.filter(id => id !== userId);
      if (prev.length >= maxPlaces) return prev;
      return [...prev, userId];
    });
    setAffectMode('MANUEL');
  };

  const handleAffectUsers = async (onClose: () => void) => {
    if (selectedUsers.length === 0) {
      alert('Veuillez sélectionner au moins un utilisateur');
      return;
    }
    try {
      setSubmitting(true);
      let successCount = 0;
      const errors: string[] = [];

      for (const userId of selectedUsers) {
        try {
          await api.post('/affectations/assign', {
            taskId,
            userId,
            modeAffectation: affectMode,
            rapportIA: affectMode === 'AUTOMATISE_IA' ? iaReports[userId] || '' : undefined
          });
          successCount++;
        } catch (error: unknown) {
          const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur inconnue';
          errors.push(msg);
        }
      }

      if (successCount > 0 && errors.length === 0) {
        alert(`${successCount} utilisateur(s) affecté(s) à la tâche avec succès !`);
        onClose();
      } else if (successCount > 0) {
        alert(`${successCount} affecté(s) avec succès.\n\nErreurs :\n${errors.join('\n')}`);
        onClose();
      } else {
        alert(`Aucune affectation créée.\n\nErreurs :\n${errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      alert('Erreur lors de l\'affectation des utilisateurs');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSemiAutoAffect = async () => {
    try {
      setSubmitting(true);
      const response = await api.post('/affectations/assign-semi-auto', { taskId });
      const suggestedUsers = response.data.data;
      if (suggestedUsers?.length > 0) {
        setSelectedUsers(suggestedUsers.map((u: User) => u._id));
        setAffectMode('SEMI_AUTOMATISE');
        alert(`${suggestedUsers.length} utilisateur(s) suggéré(s)`);
      } else {
        alert('Aucun utilisateur disponible pour cette tâche');
      }
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'affectation semi-automatique';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoAffectGroq = async () => {
    try {
      setSubmitting(true);
      const response = await api.post('/affectations/assign-auto', { taskId });
      const suggestedUsers = response.data.data;
      if (suggestedUsers?.length > 0) {
        setSelectedUsers(suggestedUsers.map((u: User) => u._id));
        setAffectMode('AUTOMATISE_IA');
        const reports: Record<string, string> = {};
        suggestedUsers.forEach((u: User & { rapportIA?: string }) => {
          if (u._id && u.rapportIA) reports[u._id] = u.rapportIA;
        });
        setIaReports(reports);
        alert(`${suggestedUsers.length} utilisateur(s) suggéré(s) par Groq`);
      } else {
        alert('Aucun utilisateur disponible pour cette tâche');
      }
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'affectation auto Groq';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    users,
    loading,
    selectedUsers,
    submitting,
    existingAffectationsCount,
    validAffectationsCount,
    handleToggleUser,
    handleAffectUsers,
    handleSemiAutoAffect,
    handleAutoAffectGroq,
  };
}
