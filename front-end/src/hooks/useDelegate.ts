import { useState, useEffect } from 'react';
import api from '../services/api';
import type { User } from '../types/User.d';

export function useDelegate(affectationId: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [justificatif, setJustificatif] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/auditeurs/list');
        setUsers(response.data.data || response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        alert('Erreur lors de la récupération des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelegate = async (onSuccess: () => void, onClose: () => void) => {
    if (!selectedUser) {
      alert('Veuillez sélectionner un utilisateur');
      return;
    }
    if (!justificatif.trim()) {
      alert('Veuillez saisir la raison de la délégation');
      return;
    }
    try {
      setSubmitting(true);

      await api.put(`/affectations/${affectationId}`, {
        statutAffectation: 'DELEGUEE',
        justificatif
      });

      const affectationResponse = await api.get('/affectations');
      const currentAffectation = affectationResponse.data.data.find(
        (aff: { _id: string }) => aff._id === affectationId
      );

      if (currentAffectation) {
        await api.post('/affectations/assign', {
          taskId: currentAffectation.tache._id || currentAffectation.tache,
          userId: selectedUser,
          modeAffectation: 'MANUEL',
          affectationOrigine: affectationId
        });
      }

      alert('Tâche déléguée avec succès !');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la délégation';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    users,
    loading,
    selectedUser,
    setSelectedUser,
    submitting,
    justificatif,
    setJustificatif,
    handleDelegate,
  };
}
