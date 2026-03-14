import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Auditeur } from '../types/User.d';
import type { DashboardStats, UseAuditeursOptions } from '../types/Auditeurs.d';
import type {
  AuditorStats,
  AffectationWithTask,
  Task,
  RecentAffectation,
  TaskWithTimestamp,
  ApiAffectation,
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentAffectations, setRecentAffectations] = useState<RecentAffectation[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    activeAuditors: 0,
    inProgressTasks: 0,
    assignedTasks: 0,
    cancelledTasks: 0,
    acceptanceRate: 0,
  });
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

  useEffect(() => {
    if (mode !== 'main-dashboard') return;

    const fetchMainDashboardData = async () => {
      try {
        setLoading(true);

        if (!options.user) {
          setLoading(false);
          return;
        }

        const statsResponse = await api.get('/tasks/stats');
        setDashboardStats(statsResponse.data.data);

        const tasksResponse = await api.get('/tasks');
        const apiTasks = tasksResponse.data.data || tasksResponse.data;

        const mappedTasks = apiTasks
          .map((task: Record<string, unknown>) => ({
            id: task._id as string,
            name: task.nom as string,
            description: task.description as string,
            status: task.statutTache as Task['status'],
            type: task.typeTache as Task['type'],
            startDate: task.dateDebut as string,
            endDate: task.dateFin as string,
            direction: task.directionAssociee as string,
            placesCount: task.nombrePlaces as number,
            isRemunerated: task.remuneree as boolean,
            createdAt: task.createdAt as string,
          }))
          .sort((a: TaskWithTimestamp, b: TaskWithTimestamp) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setTasks(mappedTasks.slice(0, 5));

        const affectationsResponse = await api.get('/affectations/recent?limit=5');
        const apiAffectations = affectationsResponse.data.data || affectationsResponse.data;

        const mappedAffectations = apiAffectations
          .filter((aff: ApiAffectation) => aff.auditeur)
          .map((aff: ApiAffectation) => ({
            id: aff._id,
            userName: `${aff.auditeur?.prenom || ''} ${aff.auditeur?.nom || ''}`,
            taskName: aff.tache?.nom || 'Tache supprimee',
            status: aff.statutAffectation,
            date: aff.updatedAt || aff.createdAt || '',
          }));

        setRecentAffectations(mappedAffectations);
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        alert('Erreur de chargement du dashboard. Verifiez la console.');
      } finally {
        setLoading(false);
      }
    };

    fetchMainDashboardData();
  }, [mode, options.user]);

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
    tasks,
    recentAffectations,
    dashboardStats,
    searchQuery,
    setSearchQuery,
    openMenuId,
    setOpenMenuId,
    filteredAuditeurs,
    handleCreateConversation,
  };
}
