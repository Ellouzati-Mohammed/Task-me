import { 
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Filter,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  MessageSquare,
  FileText,
  Download
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DelegateModal } from '../components/DelegateModal';
import { RefuseModal } from '../components/RefuseModal';
import '../Styles/Tasks.css';
import type { MyTaskStatus, MyTaskStatusConfig } from "../types/Affectation.d";
import { useMyTasks } from '../hooks/useMyTasks';

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
  const {
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
  } = useMyTasks();

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
                        {(affectation as { canDelegate?: boolean }).canDelegate !== false && (
                          <button 
                            className="task-action-btn delegate"
                            onClick={() => handleDelegate(affectation._id, task.nom)}
                            title="Déléguer"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                        )}
                      </div>
                    ) : status === 'accepted' ? (
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
                    ) : null}
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
                
                {/* Fichier joint */}
                {task.fichierJoint && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '10px 12px', 
                    backgroundColor: '#eff6ff', 
                    borderRadius: '6px', 
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="#2563eb" />
                      <span style={{ color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>
                        {task.fichierJoint}
                      </span>
                    </div>
                    <a 
                      href={`http://localhost:5000/api/tasks/download/${task.fichierJoint}`}
                      download
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: '500',
                        fontSize: '13px',
                        borderRadius: '5px',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                      <Download size={14} />
                      Télécharger
                    </a>
                  </div>
                )}
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
