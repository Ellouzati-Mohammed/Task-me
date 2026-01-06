import { 
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Filter,
  Pencil,
  Trash2,
  UserPlus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { TaskFormModal } from '../components/TaskFormModal';
import { AffectationModal } from '../components/AffectationModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import '../Styles/Tasks.css';
import type { Task, TaskStatus, StatusConfig, TypeLabels } from "../types/Dashboard.d";
import api from '../services/api';

const statusConfig: StatusConfig = {
  pending: { label: 'Créée', className: 'pending' },
  affectation: { label: 'En affectation', className: 'affectation' },
  affectee: { label: 'Complétée/Affectée', className: 'affectee' },
  encours: { label: 'En cours', className: 'encours' },
  completed: { label: 'Terminée', className: 'completed' },
  cancelled: { label: 'Annulée', className: 'cancelled' },
};

const typeLabels: TypeLabels = {
  formateur: 'Formateur',
  membre_jury: 'Membre de jury',
  beneficiaire_formation: 'Bénéficiaire',
  observateur: 'Observateur',
  concepteur_evaluation: 'Concepteur',
};

const statusFilters = [
  { value: 'all' as const, label: 'Toutes' },
  { value: 'pending' as const, label: 'Créées' },
  { value: 'affectation' as const, label: 'En affectation' },
  { value: 'affectee' as const, label: 'Affectées' },
  { value: 'encours' as const, label: 'En cours' },
  { value: 'completed' as const, label: 'Terminées' },
  { value: 'cancelled' as const, label: 'Annulées' },
];

// Fonctions de mapping pour convertir les données de l'API
const mapStatutToStatus = (statut: string): TaskStatus => {
  const mapping: Record<string, TaskStatus> = {
    'CREEE': 'pending',
    'EN_AFFECTATION': 'affectation',
    'COMPLETEE_AFFECTEE': 'affectee',
    'EN_COURS': 'encours',
    'TERMINEE': 'completed',
    'ANNULEE': 'cancelled'
  };
  return mapping[statut] || 'pending';
};

const mapTypeTacheToType = (typeTache: string): TaskType => {
  const mapping: Record<string, TaskType> = {
    'Formateur': 'formateur',
    'Membre de Jury': 'membre_jury',
    'Bénéficiaire de formation': 'beneficiaire_formation',
    'Observateur': 'observateur',
    'Concepteur': 'concepteur_evaluation'
  };
  return mapping[typeTache] || 'formateur';
};

export function Tasks() {
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [showAffectationModal, setShowAffectationModal] = useState(false);
  const [selectedTaskForAffectation, setSelectedTaskForAffectation] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<string | null>(null);

  // Charger les tâches depuis l'API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tasks');
        const apiTasks = response.data.data || response.data;
        
        // Mapper les données de l'API au format attendu
        const mappedTasks = apiTasks.map((task: any) => ({
          id: task._id,
          name: task.nom,
          description: task.description,
          status: mapStatutToStatus(task.statutTache),
          type: mapTypeTacheToType(task.typeTache),
          startDate: task.dateDebut,
          endDate: task.dateFin,
          direction: task.directionAssociee,
          placesCount: task.nombrePlaces,
          isRemunerated: task.remuneree
        }));
        
        setTasks(mappedTasks);
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Recharger les tâches après création/modification
  const handleTaskUpdated = () => {
    setShowCreateModal(false);
    setEditingTask(null);
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        const apiTasks = response.data.data || response.data;
        
        // Mapper les données de l'API au format attendu
        const mappedTasks = apiTasks.map((task: any) => ({
          id: task._id,
          name: task.nom,
          description: task.description,
          status: mapStatutToStatus(task.statutTache),
          type: mapTypeTacheToType(task.typeTache),
          startDate: task.dateDebut,
          endDate: task.dateFin,
          direction: task.directionAssociee,
          placesCount: task.nombrePlaces,
          isRemunerated: task.remuneree
        }));
        
        setTasks(mappedTasks);
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
      }
    };
    fetchTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        handleTaskUpdated();
        setOpenMenuId(null);
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        alert('Erreur lors de la suppression de la tâche');
      }
    }
  };

  const handleEditTask = async (taskId: string) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      const taskData = response.data.data || response.data;
      setEditingTask(taskData);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error);
      alert('Erreur lors de la récupération de la tâche');
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tasks-page">
      <PageHeader
        title="Gestion des tâches"
        subtitle="Consultez et gérez toutes les tâches et missions"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={(value) => setStatusFilter(value as 'all' | TaskStatus)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewClick={() => setShowCreateModal(true)}
        newButtonText="Nouvelle tâche"
        resultsCount={filteredTasks.length}
        getFilterCount={(value) => value === 'all' ? tasks.length : tasks.filter(t => t.status === value).length}
      />

      {/* Loading state */}
      {loading ? (
        <div className="empty-state-card">
          <h3 className="empty-state-title">Chargement des tâches...</h3>
        </div>
      ) : (
        <>
          {/* Task List */}
          {filteredTasks.length > 0 ? (
        <div className={`tasks-container ${viewMode}`}>
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="task-item-card" 
              onClick={() => handleShowTaskDetail(task.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="task-item-header">
                <div className="task-item-title-section">
                  <h3 className="task-item-title">{task.name}</h3>
                  <span className={`task-status-badge ${statusConfig[task.status].className}`}>
                    {statusConfig[task.status].label}
                  </span>
                </div>
                <div className="task-item-badges">
                  <span className="task-type-badge-small">
                    {typeLabels[task.type]}
                  </span>
                  {task.isRemunerated && (
                    <span className="task-remunerated-badge-small">
                      Rémunérée
                    </span>
                  )}
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="task-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === task.id ? null : task.id);
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenuId === task.id && (
                      <div className="user-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="menu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAffectTask(task.id);
                          }}
                        >
                          <UserPlus size={14} style={{ marginRight: '8px' }} />
                          Affecter
                        </button>
                        <button 
                          className="menu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task.id);
                          }}
                        >
                          <Pencil size={14} style={{ marginRight: '8px' }} />
                          Modifier
                        </button>
                        <button 
                          className="menu-item delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                        >
                          <Trash2 size={14} style={{ marginRight: '8px' }} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="task-item-description">{task.description}</p>

              <div className="task-item-meta">
                <div className="task-meta-item">
                  <Calendar size={14} />
                  <span>{new Date(task.startDate).toLocaleDateString('fr-FR')} - {new Date(task.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
                {task.direction && (
                  <div className="task-meta-item">
                    <MapPin size={14} />
                    <span>{task.direction.replace('_', ' - ')}</span>
                  </div>
                )}
                <div className="task-meta-item">
                  <Users size={14} />
                  <span>{task.placesCount} place{task.placesCount > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state-icon-wrapper">
            <Filter size={24} />
          </div>
          <h3 className="empty-state-title">Aucune tâche trouvée</h3>
          <p className="empty-state-text">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
        </>
      )}

      {showCreateModal && <TaskFormModal onClose={handleTaskUpdated} mode="create" />}
      {editingTask && <TaskFormModal onClose={handleTaskUpdated} mode="edit" task={editingTask} />}
      
      {/* Modal d'affectation */}
      {showAffectationModal && selectedTaskForAffectation && (
        <AffectationModal 
          taskId={selectedTaskForAffectation}
          onClose={handleCloseAffectationModal}
        />
      )}
      
      {/* Modal de détails de la tâche */}
      {showDetailModal && selectedTaskForDetail && (
        <TaskDetailModal 
          taskId={selectedTaskForDetail}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
}
