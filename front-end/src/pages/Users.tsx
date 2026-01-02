import { 
  Mail,
  Briefcase,
  GraduationCap,
  Calendar,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import '../Styles/Users.css';
import type { User, UserStatus } from "../types/User.d";

const roleConfig = {
  superadmin: { label: 'Super Admin', color: '#8b5cf6' },
  admin: { label: 'Admin', color: '#3b82f6' },
  coordinateur: { label: 'Coordinateur', color: '#14b8a6' },
  auditeur: { label: 'Auditeur', color: '#f59e0b' },
  planification: { label: 'Planification', color: '#ec4899' },
  formateur: { label: 'Formateur', color: '#10b981' },
};

const statusFilters = [
  { value: 'all' as const, label: 'Tous' },
  { value: 'active' as const, label: 'Actifs' },
  { value: 'inactive' as const, label: 'Inactifs' },
  { value: 'suspended' as const, label: 'Suspendus' },
];

const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Benali',
    email: 'ahmed.benali@taskme.ma',
    role: 'coordinateur',
    department: 'Pédagogique',
    grade: 'A',
    hireDate: '2020-01-15',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Fatima',
    lastName: 'Zahra',
    email: 'fatima.zahra@taskme.ma',
    role: 'auditeur',
    department: 'Orientation',
    grade: 'B',
    hireDate: '2021-03-20',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Youssef',
    lastName: 'Bennani',
    email: 'youssef.bennani@taskme.ma',
    role: 'planification',
    department: 'Planification',
    grade: 'A',
    hireDate: '2019-09-10',
    status: 'active'
  },
  {
    id: '4',
    firstName: 'Sara',
    lastName: 'Idrissi',
    email: 'sara.idrissi@taskme.ma',
    role: 'formateur',
    department: 'Formation',
    grade: 'B',
    hireDate: '2022-01-05',
    status: 'active'
  },
  {
    id: '5',
    firstName: 'Mohammed',
    lastName: 'Alami',
    email: 'mohammed.alami@taskme.ma',
    role: 'admin',
    department: 'Administration',
    grade: 'A',
    hireDate: '2018-06-01',
    status: 'active'
  },
  {
    id: '6',
    firstName: 'Amina',
    lastName: 'Chakir',
    email: 'amina.chakir@taskme.ma',
    role: 'auditeur',
    department: 'Qualité',
    grade: 'A',
    hireDate: '2020-11-15',
    status: 'inactive'
  }
];

export function Users() {
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
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
        onNewClick={() => console.log('New user')}
        newButtonText="Nouvel utilisateur"
        resultsCount={filteredUsers.length}
        getFilterCount={(value) => value === 'all' ? mockUsers.length : mockUsers.filter(u => u.status === value).length}
      />

      {/* User List */}
      {filteredUsers.length > 0 ? (
        <div className={`users-container ${viewMode}`}>
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar-section">
                  <div 
                    className="user-avatar"
                    style={{ backgroundColor: roleConfig[user.role].color }}
                  >
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div className="user-name-section">
                    <h3 className="user-name">{user.firstName} {user.lastName}</h3>
                    <span className="user-grade">Grade {user.grade}</span>
                  </div>
                </div>
                <button className="user-menu-button">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="user-card-body">
                <div className="user-info-item">
                  <Mail size={16} className="user-info-icon" />
                  <span className="user-info-text">{user.email}</span>
                </div>
                <div className="user-info-item">
                  <Briefcase size={16} className="user-info-icon" />
                  <span className="user-info-text">{roleConfig[user.role].label}</span>
                </div>
                <div className="user-info-item">
                  <GraduationCap size={16} className="user-info-icon" />
                  <span className="user-info-text">{user.department}</span>
                </div>
              </div>

              <div className="user-card-footer">
                <div className="user-footer-item">
                  <span className="user-footer-label">{getYearsOfService(user.hireDate)} ans d'ancienneté</span>
                </div>
                <div className="user-footer-item">
                  <Calendar size={14} />
                  <span className="user-footer-text">Depuis {new Date(user.hireDate).getFullYear()}</span>
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
    </div>
  );
}
