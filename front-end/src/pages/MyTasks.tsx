import { 
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Filter,
  CheckCircle,
  XCircle,
  ArrowRightLeft
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import '../Styles/Tasks.css';
import type { Task, TaskStatus, StatusConfig, TypeLabels } from "../types/Dashboard.d";

const statusConfig: StatusConfig = {
  pending: { label: 'En attente', className: 'pending' },
  accepted: { label: 'Acceptée', className: 'accepted' },
  refused: { label: 'Refusée', className: 'refused' },
  delegated: { label: 'Déléguée', className: 'delegated' },
  completed: { label: 'Terminée', className: 'completed' },
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
  { value: 'pending' as const, label: 'En attente' },
  { value: 'accepted' as const, label: 'Acceptées' },
  { value: 'refused' as const, label: 'Refusées' },
  { value: 'delegated' as const, label: 'Déléguées' },
  { value: 'completed' as const, label: 'Terminées' },
];

// Tâches assignées à l'utilisateur connecté
const mockMyTasks: Task[] = [
  {
    id: '1',
    name: 'Formation React Avancé',
    description: 'Formation sur les concepts avancés de React incluant hooks personnalisés, performance et patterns de conception.',
    status: 'accepted',
    type: 'formateur',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    direction: 'rabat_casa',
    placesCount: 2,
    isRemunerated: true
  },
  {
    id: '2',
    name: 'Audit Pédagogique Q1',
    description: 'Audit trimestriel des programmes de formation et évaluation des résultats.',
    status: 'accepted',
    type: 'observateur',
    startDate: '2024-02-20',
    endDate: '2024-02-22',
    direction: 'meknes_errachidia',
    placesCount: 3,
    isRemunerated: true
  },
  {
    id: '3',
    name: 'Jury Certification Développeur',
    description: 'Participation au jury d\'évaluation pour la certification des développeurs web.',
    status: 'pending',
    type: 'membre_jury',
    startDate: '2024-03-01',
    endDate: '2024-03-01',
    placesCount: 1,
    isRemunerated: true
  },
  {
    id: '4',
    name: 'Formation Continue Formateurs',
    description: 'Session de formation continue pour les formateurs sur les nouvelles méthodologies pédagogiques.',
    status: 'completed',
    type: 'formateur',
    startDate: '2024-01-15',
    endDate: '2024-01-18',
    direction: 'meknes_errachidia',
    placesCount: 2,
    isRemunerated: true
  }
];

export function MyTasks() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = mockMyTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAccept = (taskId: string) => {
    console.log('Accepter la tâche:', taskId);
    // TODO: API call
  };

  const handleRefuse = (taskId: string) => {
    console.log('Refuser la tâche:', taskId);
    // TODO: API call
  };

  const handleDelegate = (taskId: string) => {
    console.log('Déléguer la tâche:', taskId);
    // TODO: API call
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
        onFilterChange={(value) => setStatusFilter(value as 'all' | TaskStatus)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewClick={() => {}}
        newButtonText=""
        resultsCount={filteredTasks.length}
        getFilterCount={(value) => value === 'all' ? mockMyTasks.length : mockMyTasks.filter(t => t.status === value).length}
      />

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className={`tasks-container ${viewMode}`}>
          {filteredTasks.map((task) => (
            <div key={task.id} className="task-item-card">
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
                  {task.status === 'pending' ? (
                    <div className="task-action-buttons">
                      <button 
                        className="task-action-btn accept"
                        onClick={() => handleAccept(task.id)}
                        title="Accepter"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        className="task-action-btn refuse"
                        onClick={() => handleRefuse(task.id)}
                        title="Refuser"
                      >
                        <XCircle size={18} />
                      </button>
                      <button 
                        className="task-action-btn delegate"
                        onClick={() => handleDelegate(task.id)}
                        title="Déléguer"
                      >
                        <ArrowRightLeft size={18} />
                      </button>
                    </div>
                  ) : (
                    <button className="task-menu-button">
                      <MoreHorizontal size={18} />
                    </button>
                  )}
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
    </div>
  );
}
