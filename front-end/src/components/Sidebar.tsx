import {
  LayoutDashboard,
  ClipboardList,
  ClipboardCheck,
  Users,
  Car,
  Bell,
  MessageSquare,
  UserCircle,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../Styles/Sidebar.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard', roles: ['admin'] },
  { icon: LayoutDashboard, label: 'Mon tableau de bord', href: '/auditor-dashboard', roles: ['auditeur'] },
  { icon: ClipboardList, label: 'Tâches', href: '/tasks', roles: ['admin', 'coordinateur'] },
  { icon: ClipboardCheck, label: 'Mes tâches', href: '/my-tasks', roles: ['auditeur'] },
  { icon: Users, label: 'Utilisateurs', href: '/users', roles: ['admin', 'coordinateur'] },
  { icon: Car, label: 'Véhicules', href: '/vehicles', roles: ['admin', 'coordinateur'] },
  { icon: Bell, label: 'Notifications', href: '/notifications', roles: [] },
  { icon: MessageSquare, label: 'Messages', href: '/messages', roles: [] },
  { icon: UserCircle, label: 'Profil', href: '/profile', roles: ['admin', 'coordinateur', 'auditeur'] },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout();
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-container">
        {/* Logo */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <Link to="/dashboard" className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <span>T</span>
              </div>
              <span className="sidebar-logo-text">Taskme</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-toggle-btn"
          >
            {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems
            .filter((item) => user && item.roles.includes(user.role))
            .map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`sidebar-nav-link ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="sidebar-nav-icon" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
        </nav>

        {/* User section */}
        <div className="sidebar-user-section">
          {!isCollapsed && user && (
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user.prenom} {user.nom}</p>
              <p className="sidebar-user-role">
                {user.role === 'admin' ? 'Administrateur' : 
                 user.role === 'coordinateur' ? 'Coordinateur' : 'Auditeur'}
              </p>
            </div>
          )}
          <button 
            className={`sidebar-logout-btn ${isCollapsed ? 'collapsed' : 'expanded'}`}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
