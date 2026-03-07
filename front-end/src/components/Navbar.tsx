import { Search, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Navbar.css';
import { useAuth } from '../contexts/AuthContext';
import type { NavbarProps } from "../types/Navbar";
import { getSocket } from '../services/socket';
import api from '../services/api';



export function Navbar({ title, subtitle }: NavbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const userInitials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : 'MA';

  // Charger le nombre de notifications non lues
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications/unread/count');
        if (response.data.success) {
          setUnreadCount(response.data.count);
        }
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    const socket = getSocket();
    
    if (socket) {
      // Nouvelle notification
      socket.on('notification', () => {
        setUnreadCount(prev => prev + 1);
      });
      
      // Mise à jour du compteur quand on marque comme lu
      socket.on('unreadCountUpdate', (data: { count: number }) => {
        setUnreadCount(data.count);
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
        socket.off('unreadCountUpdate');
      }
    };
  }, []);

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
          <button 
            className="navbar-notification-btn"
            onClick={() => navigate('/notifications')}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="navbar-notification-badge">{unreadCount}</span>
            )}
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
