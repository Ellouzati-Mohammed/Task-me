import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Car,
  Bell,
  MessageSquare,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import '../Styles/Sidebar.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '#dashboard' },
  { icon: ClipboardList, label: 'Tâches', href: '#tasks' },
  { icon: Users, label: 'Utilisateurs', href: '#users' },
  { icon: Car, label: 'Véhicules', href: '#vehicles' },
  { icon: Bell, label: 'Notifications', href: '#notifications' },
  { icon: MessageSquare, label: 'Messages', href: '#messages' },
  { icon: History, label: 'Historique', href: '#history' },
  { icon: Settings, label: 'Paramètres', href: '#settings' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeHref, setActiveHref] = useState('#dashboard');

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-container">
        {/* Logo */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <a href="#dashboard" className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <span>T</span>
              </div>
              <span className="sidebar-logo-text">Taskme</span>
            </a>
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
          {navItems.map((item) => {
            const isActive = activeHref === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveHref(item.href);
                }}
                className={`sidebar-nav-link ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="sidebar-nav-icon" />
                {!isCollapsed && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* User section */}
        <div className="sidebar-user-section">
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">Mohammed Alami</p>
              <p className="sidebar-user-role">Super Admin</p>
            </div>
          )}
          <button className={`sidebar-logout-btn ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <LogOut size={20} />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
