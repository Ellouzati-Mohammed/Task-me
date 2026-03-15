import { 
  Mail,
  Briefcase,
  GraduationCap,
  Calendar,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { UserFormModal } from '../components/UserFormModal';
import '../Styles/Users.css';
import type { UserStatus } from '../types/User.d';
import { useUsers } from '../hooks/useUsers';

const roleConfig = {
  admin: { label: 'Admin', color: '#3b82f6' },
  coordinateur: { label: 'Coordinateur', color: '#14b8a6' },
  auditeur: { label: 'Auditeur', color: '#f59e0b' },
};

const statusFilters = [
  { value: 'all' as const, label: 'Tous' },
  { value: 'active' as const, label: 'Actifs' },
  { value: 'inactive' as const, label: 'Inactifs' },
];

export function Users() {
  const {
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    showCreateModal,
    setShowCreateModal,
    activeMenuUserId,
    setActiveMenuUserId,
    selectedUser,
    editMode,
    users,
    loading,
    filteredUsers,
    handleDeleteUser,
    handleEditUser,
    handleCloseModal,
    getInitials,
    getYearsOfService,
  } = useUsers();

  return (
    <div className="users-page">
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle="Gérez les utilisateurs et leurs permissions"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={(value) => setStatusFilter(value as 'all' | UserStatus)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewClick={() => setShowCreateModal(true)}
        newButtonText="Nouvel utilisateur"
        resultsCount={filteredUsers.length}
        getFilterCount={(value) => {
          if (value === 'all') return users.length;
          if (value === 'active') return users.filter(u => u.actif).length;
          if (value === 'inactive') return users.filter(u => !u.actif).length;
          return 0;
        }}
      />

      {/* Loading State */}
      {loading && (
        <div className="users-loading">
          <p>Chargement des utilisateurs...</p>
        </div>
      )}

      {/* User List */}
      {!loading && filteredUsers.length > 0 ? (
        <div className={`users-container ${viewMode}`}>
          {filteredUsers.map((user) => (
            <div key={user._id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar-section">
                  <div 
                    className="user-avatar"
                    style={{ backgroundColor: roleConfig[user.role]?.color || '#9ca3af' }}
                  >
                    {getInitials(user.prenom, user.nom)}
                  </div>
                  <div className="user-name-section">
                    <h3 className="user-name">{user.prenom} {user.nom}</h3>
                    {user.role !== 'admin' && user.role !== 'coordinateur' && (
                      <span className="user-grade">Grade {user.grade}</span>
                    )}
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <button 
                    className="user-menu-button"
                    onClick={() => setActiveMenuUserId(activeMenuUserId === user._id ? null : user._id)}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {activeMenuUserId === user._id && (
                    <div className="user-menu-dropdown">
                      <button 
                        className="menu-item"
                        onClick={() => handleEditUser(user)}
                      >
                        Modifier
                      </button>
                      <button 
                        className="menu-item delete"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="user-card-body">
                <div className="user-info-item">
                  <Mail size={14} className="user-info-icon" />
                  <span className="user-info-text">{user.email}</span>
                </div>
                <div className="user-info-item">
                  <Briefcase size={14} className="user-info-icon" />
                  <span className="user-info-text">{roleConfig[user.role]?.label || user.role}</span>
                </div>
                {user.role !== 'admin' && user.role !== 'coordinateur' && (
                  <div className="user-info-item">
                    <GraduationCap size={14} className="user-info-icon" />
                    <span className="user-info-text">{user.specialite}</span>
                  </div>
                )}
              </div>

              <div className="user-card-footer">
                <div className="user-footer-item">
                  <span className="user-footer-label">{getYearsOfService(user.dateembauche)} ans d'ancienneté</span>
                </div>
                <div className="user-footer-item">
                  <Calendar size={14} />
                  <span className="user-footer-text">Depuis {new Date(user.dateembauche).getFullYear()}</span>
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
          <h3 className="empty-state-title">Aucun utilisateur trouvé</h3>
          <p className="empty-state-text">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}

      {showCreateModal && <UserFormModal onClose={handleCloseModal} mode="create" />}
      {editMode && <UserFormModal onClose={handleCloseModal} mode="edit" user={selectedUser} />}
    </div>
  );
}
