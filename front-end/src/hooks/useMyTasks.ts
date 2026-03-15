import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Affectation, MyTaskStatus } from '../types/Affectation.d';

export function useMyTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'all' | MyTaskStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [selectedAffectationId, setSelectedAffectationId] = useState<string | null>(null);
  const [selectedTaskName, setSelectedTaskName] = useState<string>('');
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [selectedAffectationForRefuse, setSelectedAffectationForRefuse] = useState<string | null>(null);
  const [selectedTaskNameForRefuse, setSelectedTaskNameForRefuse] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/affectations/my-tasks');
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      console.error('Erreur récupération tâches:', err);
      setError('Erreur lors du chargement de vos tâches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const filteredTasks = tasks.filter((affectation) => {
    const task = affectation.tache;
    if (!task) return false;

    const matchesSearch =
      task.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    let taskStatus: MyTaskStatus = 'pending';
    if (affectation.statutAffectation === 'ACCEPTEE') taskStatus = 'accepted';
    else if (affectation.statutAffectation === 'REFUSEE') taskStatus = 'refused';
    else if (affectation.statutAffectation === 'DELEGUEE') taskStatus = 'delegated';
    else if (task.statutTache === 'TERMINEE') taskStatus = 'completed';

    const matchesStatus = statusFilter === 'all' || taskStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAccept = async (affectationId: string) => {
    try {
      await api.put(`/affectations/${affectationId}`, { statutAffectation: 'ACCEPTEE' });
      await fetchMyTasks();
    } catch (err) {
      console.error('Erreur acceptation tâche:', err);
    }
  };

  const handleRefuse = (affectationId: string, taskName: string) => {
    setSelectedAffectationForRefuse(affectationId);
    setSelectedTaskNameForRefuse(taskName);
    setShowRefuseModal(true);
  };

  const handleCloseRefuseModal = () => {
    setShowRefuseModal(false);
    setSelectedAffectationForRefuse(null);
    setSelectedTaskNameForRefuse('');
  };

  const handleRefuseSuccess = async () => {
    await fetchMyTasks();
  };

  const handleDelegate = (affectationId: string, taskName: string) => {
    setSelectedAffectationId(affectationId);
    setSelectedTaskName(taskName);
    setShowDelegateModal(true);
  };

  const handleCloseDelegateModal = () => {
    setShowDelegateModal(false);
    setSelectedAffectationId(null);
    setSelectedTaskName('');
  };

  const handleDelegateSuccess = async () => {
    await fetchMyTasks();
  };

  const handleCreateTaskConversation = async (taskId: string) => {
    try {
      const response = await api.post('/chats/task-conversation', { taskId });
      if (response.data.success) {
        navigate('/messages');
      }
    } catch (err) {
      console.error('Erreur création conversation de groupe:', err);
    }
  };

  return {
    user,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    tasks,
    loading,
    error,
    showDelegateModal,
    selectedAffectationId,
    selectedTaskName,
    showRefuseModal,
    selectedAffectationForRefuse,
    selectedTaskNameForRefuse,
    openMenuId,
    setOpenMenuId,
    filteredTasks,
    handleAccept,
    handleRefuse,
    handleCloseRefuseModal,
    handleRefuseSuccess,
    handleDelegate,
    handleCloseDelegateModal,
    handleDelegateSuccess,
    handleCreateTaskConversation,
  };
}
