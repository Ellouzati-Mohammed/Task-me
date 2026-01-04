import { Search, Bell } from 'lucide-react';
import '../Styles/Navbar.css';
import { useAuth } from '../contexts/AuthContext';
import type { NavbarProps } from "../types/Navbar";



export function Navbar({ title, subtitle }: NavbarProps) {
  const { user } = useAuth();
  const userInitials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : 'MA';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <h1 className="navbar-title">{title}</h1>
          {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
        </div>
        <div className="navbar-right">
          {/* Search */}
          <div className="navbar-search-container">
            <Search className="navbar-search-icon" />
            <input
              type="search"
              placeholder="Rechercher..."
              className="navbar-search-input"
            />
          </div>

          {/* Notifications */}
          <button className="navbar-notification-btn">
            <Bell size={20} />
            <span className="navbar-notification-badge">3</span>
          </button>

          {/* User avatar */}
          <div className="navbar-user-container">
            <div className="navbar-avatar">
              <span className="navbar-avatar-text">{userInitials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
