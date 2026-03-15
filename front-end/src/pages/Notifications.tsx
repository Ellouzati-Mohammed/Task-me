import {
  ClipboardList,
  AlertCircle,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import '../Styles/Notifications.css';
import type { NotificationType } from '../types/Notification.d';
import { useNotifications } from '../hooks/useNotifications';

const notificationTypeConfig = {
  task_assigned: {
    icon: ClipboardList,
    iconColor: '#14b8a6',
    backgroundColor: 'rgba(20, 184, 166, 0.1)'
  },
  task_modified: {
    icon: AlertCircle,
    iconColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)'
  },
  delegation_request: {
    icon: ArrowRightLeft,
    iconColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)'
  },
  reminder: {
    icon: Clock,
    iconColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  },
  task_accepted: {
    icon: CheckCircle,
    iconColor: '#64748b',
    backgroundColor: 'rgba(100, 116, 139, 0.1)'
  },
  task_rejected: {
    icon: XCircle,
    iconColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  }
};

export function Notifications() {
  const {
    notifications,
    filter,
    setFilter,
    loading,
    filteredNotifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
  } = useNotifications();

  const NotificationIcon = ({ type }: { type: NotificationType }) => {
    const config = notificationTypeConfig[type];
    const IconComponent = config.icon;
    
    return (
      <div 
        className="notification-icon"
        style={{ 
          backgroundColor: config.backgroundColor,
          color: config.iconColor 
        }}
      >
        <IconComponent size={20} />
      </div>
    );
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">Restez informé des dernières activités</p>
        </div>
      </div>

      <div className="notifications-toolbar">
        <div className="notification-filters">
          <button
            className={`notification-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </button>
          <button
            className={`notification-filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Non lues ({unreadCount})
          </button>
        </div>
        
        {unreadCount > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            <CheckCircle size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Chargement des notifications...
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
              onClick={() => notification.status === 'unread' && markAsRead(notification.id)}
              style={{ cursor: notification.status === 'unread' ? 'pointer' : 'default' }}
            >
              <NotificationIcon type={notification.type} />
              
              <div className="notification-content">
                <h3 className="notification-item-title">{notification.title}</h3>
                <p className="notification-description">{notification.description}</p>
              </div>

              <div className="notification-meta">
                {notification.status === 'unread' && (
                  <span className="unread-indicator"></span>
                )}
                <span className="notification-time">{notification.timestamp}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="notifications-empty">
            <div className="empty-icon">
              <CheckCircle size={48} />
            </div>
            <h3>Aucune notification</h3>
            <p>Vous n'avez aucune notification non lue</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
