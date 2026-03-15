import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Task, TaskStatus, TaskType } from '../types/Dashboard.d';

const mapStatutToStatus = (statut: string): TaskStatus => {
  const mapping: Record<string, TaskStatus> = {
    CREEE: 'pending',
    EN_AFFECTATION: 'affectation',
    COMPLETEE_AFFECTEE: 'affectee',
    EN_COURS: 'encours',
    TERMINEE: 'completed',
    ANNULEE: 'cancelled',
  };
  return mapping[statut] || 'pending';
};

const mapTypeTacheToType = (typeTache: string): TaskType => {
  const mapping: Record<string, TaskType> = {
    Formateur: 'formateur',
    'Membre de Jury': 'membre_jury',
    'Beneficiaire de formation': 'beneficiaire_formation',
    'B\u00e9n\u00e9ficiaire de formation': 'beneficiaire_formation',
    Observateur: 'observateur',
    Concepteur: 'concepteur_evaluation',
  };
  return mapping[typeTache] || 'formateur';
};

const mapStatusToStatut = (status: TaskStatus): string => {
  const mapping: Record<TaskStatus, string> = {
    pending: 'CREEE',
    affectation: 'EN_AFFECTATION',
    affectee: 'COMPLETEE_AFFECTEE',
    encours: 'EN_COURS',
    completed: 'TERMINEE',
    cancelled: 'ANNULEE',
  };
  return mapping[status];
};

const mapApiTask = (task: Record<string, unknown>): Task => ({
  id: task._id as string,
  name: task.nom as string,
  description: task.description as string,
  status: mapStatutToStatus(task.statutTache as string),
  type: mapTypeTacheToType(task.typeTache as string),
  startDate: task.dateDebut as string,
  endDate: task.dateFin as string,
  direction: task.directionAssociee as string,
  placesCount: task.nombrePlaces as number,
  isRemunerated: task.remuneree as boolean,
});

export function useTasks() {
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Record<string, unknown> | null>(null);
  const [showAffectationModal, setShowAffectationModal] = useState(false);
  const [selectedTaskForAffectation, setSelectedTaskForAffectation] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<string | null>(null);

  const fetchTasks = async (endpoint = '/tasks/my-tasks') => {
    try {
      setLoading(true);
      const response = await api.get(endpoint);
      const apiTasks = response.data.data || response.data || [];
      setTasks(apiTasks.map((task: Record<string, unknown>) => mapApiTask(task)));
    } catch (error) {
      console.error('Erreur lors du chargement des taches:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskUpdated = async () => {
    setShowCreateModal(false);
    setEditingTask(null);
    await fetchTasks('/tasks');
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer cette tache ?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      await handleTaskUpdated();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tache:', error);
      alert('Erreur lors de la suppression de la tache');
    }
  };

  const handleEditTask = async (taskId: string) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      const taskData = response.data.data || response.data;
      setEditingTask(taskData);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la recuperation de la tache:', error);
      alert('Erreur lors de la recuperation de la tache');
    }
  };

  const handleAffectTask = (taskId: string) => {
    setSelectedTaskForAffectation(taskId);
    setShowAffectationModal(true);
    setOpenMenuId(null);
  };

  const handleCloseAffectationModal = () => {
    setShowAffectationModal(false);
    setSelectedTaskForAffectation(null);
  };

  const handleShowTaskDetail = (taskId: string) => {
    setSelectedTaskForDetail(taskId);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTaskForDetail(null);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const statutTache = mapStatusToStatut(newStatus);
      await api.patch(`/tasks/${taskId}/status`, { statutTache });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut de la tache');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = task.name.toLowerCase().includes(q) || task.description.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    showCreateModal,
    setShowCreateModal,
    tasks,
    loading,
    openMenuId,
    setOpenMenuId,
    editingTask,
    showAffectationModal,
    selectedTaskForAffectation,
    showDetailModal,
    selectedTaskForDetail,
    filteredTasks,
    handleTaskUpdated,
    handleDeleteTask,
    handleEditTask,
    handleAffectTask,
    handleCloseAffectationModal,
    handleShowTaskDetail,
    handleCloseDetailModal,
    handleStatusChange,
  };
}
