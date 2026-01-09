import { 
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Filter,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { DelegateModal } from '../components/DelegateModal';
import { RefuseModal } from '../components/RefuseModal';
import api from '../services/api';
import '../Styles/Tasks.css';
import type { Affectation, MyTaskStatus, MyTaskStatusConfig } from "../types/Affectation.d";

const statusConfig: MyTaskStatusConfig = {
  pending: { label: 'En attente', className: 'pending' },
  accepted: { label: 'Acceptée', className: 'accepted' },
  refused: { label: 'Refusée', className: 'refused' },
  delegated: { label: 'Déléguée', className: 'delegated' },
  completed: { label: 'Terminée', className: 'completed' },
};

const statusFilters = [
  { value: 'all' as const, label: 'Toutes' },
  { value: 'pending' as const, label: 'En attente' },
  { value: 'accepted' as const, label: 'Acceptées' },
  { value: 'refused' as const, label: 'Refusées' },
  { value: 'delegated' as const, label: 'Déléguées' },
  { value: 'completed' as const, label: 'Terminées' },
];

export function MyTasks() {
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

  // Récupérer les tâches de l'utilisateur connecté
  useEffect(() => {
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

    fetchMyTasks();
  }, []);

  const filteredTasks = tasks.filter(affectation => {
    const task = affectation.tache;
    if (!task) return false;
    
    const matchesSearch = task.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Mapper le statut d'affectation au statut de tâche
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
      // Recharger les tâches
      const response = await api.get('/affectations/my-tasks');
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      console.error('Erreur acceptation tâche:', err);
    }
  };

  const handleRefuse = async (affectationId: string, taskName: string) => {
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
    // Recharger les tâches
    const response = await api.get('/affectations/my-tasks');
    if (response.data.success) {
      setTasks(response.data.data);
    }
  };

  const handleDelegate = async (affectationId: string, taskName: string) => {
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
    // Recharger les tâches
    const response = await api.get('/affectations/my-tasks');
    if (response.data.success) {
      setTasks(response.data.data);
    }
  };

  const handleCreateTaskConversation = async (taskId: string) => {
    try {
      const response = await api.post('/chats/task-conversation', { taskId });
      if (response.data.success) {
        // Rediriger vers la page de messages
        navigate('/messages');
      }
    } catch (error) {
      console.error('Erreur création conversation de groupe:', error);
    }
  };

  return (
    <div className="tasks-page">
      <PageHeader
        title="Mes tâches"
        subtitle={`${filteredTasks.length} tâche${filteredTasks.length > 1 ? 's' : ''} assignée${filteredTasks.length > 1 ? 's' : ''} à ${user?.prenom} ${user?.nom}`}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={(value) => setStatusFilter(value as 'all' | MyTaskStatus)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewClick={() => {}}
        newButtonText=""
        resultsCount={filteredTasks.length}
        getFilterCount={(value) => value === 'all' ? tasks.length : tasks.filter(aff => {
          let status: MyTaskStatus = 'pending';
          if (aff.statutAffectation === 'ACCEPTEE') status = 'accepted';
          else if (aff.statutAffectation === 'REFUSEE') status = 'refused';
          else if (aff.statutAffectation === 'DELEGUEE') status = 'delegated';
          else if (aff.tache?.statutTache === 'TERMINEE') status = 'completed';
          return status === value;
        }).length}
      />

      {loading ? (
        <div className="empty-state-card">
          <p className="empty-state-text">Chargement de vos tâches...</p>
        </div>
      ) : error ? (
        <div className="empty-state-card">
          <p className="empty-state-text" style={{ color: '#c33' }}>{error}</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className={`tasks-container ${viewMode}`}>
          {filteredTasks.map((affectation) => {
            const task = affectation.tache;
            if (!task) return null;
            
            // Déterminer le statut
            let status: MyTaskStatus = 'pending';
            if (affectation.statutAffectation === 'ACCEPTEE') status = 'accepted';
            else if (affectation.statutAffectation === 'REFUSEE') status = 'refused';
            else if (affectation.statutAffectation === 'DELEGUEE') status = 'delegated';
            else if (task.statutTache === 'TERMINEE') status = 'completed';

            return (
              <div key={affectation._id} className="task-item-card">
                <div className="task-item-header">
                  <div className="task-item-title-section">
                    <h3 className="task-item-title">{task.nom}</h3>
                    <span className={`task-status-badge ${statusConfig[status].className}`}>
                      {statusConfig[status].label}
                    </span>
                    </div>
                  <div className="task-item-badges">
                    <span className="task-type-badge-small">
                      {task.typeTache || 'N/A'}
                    </span>
                    {task.remuneree && (
                      <span className="task-remunerated-badge-small">
                        Rémunérée
                      </span>
                    )}
                    {status === 'pending' ? (
                      <div className="task-action-buttons">
                        <button 
                          className="task-action-btn accept"
                          onClick={() => handleAccept(affectation._id)}
                          title="Accepter"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          className="task-action-btn refuse"
                          onClick={() => handleRefuse(affectation._id, task.nom)}
                          title="Refuser"
                        >
                          <XCircle size={18} />
                        </button>
                        {affectation.canDelegate !== false && (
                          <button 
                            className="task-action-btn delegate"
                            onClick={() => handleDelegate(affectation._id, task.nom)}
                            title="Déléguer"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <button 
                          className="task-menu-button"
                          onClick={() => setOpenMenuId(openMenuId === affectation._id ? null : affectation._id)}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {openMenuId === affectation._id && (
                          <div className="task-menu-dropdown">
                            <button 
                              className="task-menu-item"
                              onClick={() => {
                                handleCreateTaskConversation(task._id);
                                setOpenMenuId(null);
                              }}
                            >
                              <MessageSquare size={16} />
                              Créer conversation
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="task-item-description">{task.description}</p>

                <div className="task-item-meta">
                  <div className="task-meta-item">
                    <Calendar size={14} />
                    <span>{new Date(task.dateDebut).toLocaleDateString('fr-FR')} - {new Date(task.dateFin).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {task.directionAssociee && (
                    <div className="task-meta-item">
                      <MapPin size={14} />
                      <span>{task.directionAssociee}</span>
                    </div>
                  )}
                  <div className="task-meta-item">
                    <Users size={14} />
                    <span>{task.nombrePlaces} place{task.nombrePlaces > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Modal de délégation */}
      {showDelegateModal && selectedAffectationId && (
        <DelegateModal 
          affectationId={selectedAffectationId}
          taskName={selectedTaskName}
          onClose={handleCloseDelegateModal}
          onSuccess={handleDelegateSuccess}
        />
      )}

      {/* Modal de refus */}
      {showRefuseModal && selectedAffectationForRefuse && (
        <RefuseModal 
          affectationId={selectedAffectationForRefuse}
          taskName={selectedTaskNameForRefuse}
          onClose={handleCloseRefuseModal}
          onSuccess={handleRefuseSuccess}
        />
      )}
    </div>
  );
}
