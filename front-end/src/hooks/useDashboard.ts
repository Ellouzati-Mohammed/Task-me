import { useEffect, useState } from 'react';
import api from '../services/api';
import type {
  DashboardStats,
  Task,
  RecentAffectation,
  TaskWithTimestamp,
  ApiAffectation,
  UseDashboardOptions,
} from '../types/Dashboard.d';

export function useDashboard(options: UseDashboardOptions = {}) {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
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
  }, [options.user]);

  return {
    loading,
    tasks,
    recentAffectations,
    dashboardStats,
  };
}
