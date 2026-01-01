import { Search, Bell } from 'lucide-react';
import '../Styles/Navbar.css';
import type { NavbarProps } from "../types/Navbar";



export function Navbar({ title, subtitle }: NavbarProps) {
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
              <span className="navbar-avatar-text">MA</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
