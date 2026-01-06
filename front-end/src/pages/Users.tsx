import { 
  Mail,
  Briefcase,
  GraduationCap,
  Calendar,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { UserFormModal } from '../components/UserFormModal';
import '../Styles/Users.css';
import type { User, UserStatus } from "../types/User.d";
import api from '../services/api';

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
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);

  const [users,setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchUsers = async () => {
      try {
        const res = await api.get("/users/"); 
        setUsers(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
     
    };
 useEffect(()=>{
  
     fetchUsers()
 },[]);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        setActiveMenuUserId(null);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditMode(true);
    setActiveMenuUserId(null);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditMode(false);
    setSelectedUser(undefined);
  
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.specialite.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.actif) ||
                         (statusFilter === 'inactive' && !user.actif);
    return matchesSearch && matchesStatus;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getYearsOfService = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    return years;
  };

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
