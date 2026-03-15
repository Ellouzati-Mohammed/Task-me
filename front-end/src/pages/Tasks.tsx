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
import { PageHeader } from '../components/PageHeader';
import { TaskFormModal } from '../components/TaskFormModal';
import { AffectationModal } from '../components/AffectationModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import '../Styles/Tasks.css';
import type { TaskStatus, StatusConfig, TypeLabels } from '../types/Dashboard.d';
import type { TaskFormData } from "../types/TaskForm.d";
import { useTasks } from '../hooks/useTasks';

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

export function Tasks() {
  const {
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
  } = useTasks();

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

              <div className="task-item-footer">
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
                
                <div className="task-status-select-wrapper">
                  <select
                    className="task-status-select"
                    value=""
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.value) {
                        handleStatusChange(task.id, e.target.value as TaskStatus);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="" disabled>Changer statut</option>
                    <option value="pending">Créée</option>
                    <option value="affectation">En affectation</option>
                    <option value="affectee">Complétée/Affectée</option>
                    <option value="encours">En cours</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
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
      {editingTask && <TaskFormModal onClose={handleTaskUpdated} mode="edit" task={editingTask as unknown as TaskFormData & { id?: string }} />}
      
      {/* Modal d'affectation */}
      {showAffectationModal && selectedTaskForAffectation && (
        <AffectationModal 
          taskId={selectedTaskForAffectation}
          taskName={tasks.find(t => t.id === selectedTaskForAffectation)?.name}
          maxPlaces={tasks.find(t => t.id === selectedTaskForAffectation)?.placesCount}
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
