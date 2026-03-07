import { useEffect, useState } from 'react';
import api from '../services/api';
import type { TaskDetail } from '../types/Dashboard.d';
import type { AffectationDetail } from '../types/Affectation.d';

export function useTaskDetail(taskId: string) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [affectations, setAffectations] = useState<AffectationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [taskResponse, affectationsResponse] = await Promise.all([
          api.get(`/tasks/${taskId}`),
          api.get(`/affectations/task/${taskId}`),
        ]);

        setTask(taskResponse.data.data || taskResponse.data);
        setAffectations(affectationsResponse.data.data || affectationsResponse.data);
      } catch {
        setError('Erreur lors du chargement des détails');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleDeleteAffectation = async (affectationId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette affectation ?')) return;
    try {
      await api.delete(`/affectations/${affectationId}`);
      setAffectations((prev) => prev.filter((a) => a._id !== affectationId));
    } catch (err) {
      alert("Erreur lors de la suppression de l'affectation " + err);
    }
  };

  return {
    task,
    affectations,
    loading,
    error,
    handleDeleteAffectation,
  };
}
