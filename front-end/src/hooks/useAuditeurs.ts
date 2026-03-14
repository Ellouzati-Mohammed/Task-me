import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Auditeur } from '../types/User.d';
import type { UseAuditeursOptions } from '../types/Auditeurs.d';
import type {
  AuditorStats,
  AffectationWithTask,
} from '../types/Dashboard.d';

export function useAuditeurs(options: UseAuditeursOptions = {}) {
  const mode = options.mode || 'auditeurs';
  const [auditeurs, setAuditeurs] = useState<Auditeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditorStats>({
    totalAffectations: 0,
    acceptedTasks: 0,
    refusedTasks: 0,
    delegatedTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [myTasks, setMyTasks] = useState<AffectationWithTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== 'auditeurs') return;
    fetchAuditeurs();
  }, [mode]);

  useEffect(() => {
    if (mode !== 'dashboard') return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsResponse = await api.get('/users/me/stats');
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        const tasksResponse = await api.get('/affectations/my-tasks');
        const affectations = tasksResponse.data.data || [];
        setMyTasks(affectations.slice(0, 5));
      } catch (err) {
        console.error('Erreur lors du chargement des donnees:', err);
        setError('Erreur lors du chargement des donnees');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [mode]);

  const fetchAuditeurs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/auditeurs/list');
      setAuditeurs(response.data.data || response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des auditeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (auditeurId: string) => {
    try {
      const response = await api.post('/chats', { otherUserId: auditeurId });
      if (response.data.success) {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      alert('Erreur lors de la création de la conversation');
    } finally {
      setOpenMenuId(null);
    }
  };

  const filteredAuditeurs = auditeurs.filter((auditeur) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      auditeur.nom.toLowerCase().includes(searchLower) ||
      auditeur.prenom.toLowerCase().includes(searchLower) ||
      auditeur.email.toLowerCase().includes(searchLower) ||
      (auditeur.specialite?.toLowerCase() || '').includes(searchLower) ||
      (auditeur.grade?.toLowerCase() || '').includes(searchLower)
    );
  });

  return {
    mode,
    auditeurs,
    loading,
    error,
    stats,
    myTasks,
    searchQuery,
    setSearchQuery,
    openMenuId,
    setOpenMenuId,
    filteredAuditeurs,
    handleCreateConversation,
  };
}
