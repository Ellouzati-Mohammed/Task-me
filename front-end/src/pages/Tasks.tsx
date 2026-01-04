import { 
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { TaskFormModal } from '../components/TaskFormModal';
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

const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Formation React Avancé',
    description: 'Formation sur les concepts avancés de React incluant hooks personnalisés, performance et patterns de conception.',
    status: 'pending',
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
    placesCount: 5,
    isRemunerated: true
  },
  {
    id: '4',
    name: 'Conception Évaluation Annuelle',
    description: 'Élaboration des évaluations annuelles pour les programmes de formation.',
    status: 'delegated',
    type: 'concepteur_evaluation',
    startDate: '2024-02-10',
    endDate: '2024-02-15',
    direction: 'rabat_casa',
    placesCount: 2,
    isRemunerated: true
  },
  {
    id: '5',
    name: 'Formation Continue Formateurs',
    description: 'Session de formation continue pour les formateurs sur les nouvelles méthodologies pédagogiques.',
    status: 'completed',
    type: 'formateur',
    startDate: '2024-01-15',
    endDate: '2024-01-18',
    direction: 'meknes_errachidia',
    placesCount: 4,
    isRemunerated: true
  }
];

export function Tasks() {
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTasks = mockTasks.filter(task => {
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
        getFilterCount={(value) => value === 'all' ? mockTasks.length : mockTasks.filter(t => t.status === value).length}
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
                  <button className="task-menu-button">
                    <MoreHorizontal size={18} />
                  </button>
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

      {showCreateModal && <TaskFormModal onClose={() => setShowCreateModal(false)} mode="create" />}
    </div>
  );
}
