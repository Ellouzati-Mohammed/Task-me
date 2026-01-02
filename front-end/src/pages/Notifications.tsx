import {
  ClipboardList,
  AlertCircle,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import '../Styles/Notifications.css';
import type { Notification, NotificationStatus, NotificationType } from '../types/Notification.d';

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

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task_assigned',
    title: 'Nouvelle tâche assignée',
    description: 'Vous avez été assigné à la tâche "Formation React Avancé". Veuillez confirmer votre participation.',
    timestamp: 'Il y a 15 h',
    status: 'unread'
  },
  {
    id: '2',
    type: 'task_modified',
    title: 'Tâche modifiée',
    description: 'La date de la tâche "Audit Pédagogique Q1" a été modifiée du 20/02 au 25/02.',
    timestamp: 'Il y a 16 h',
    status: 'unread'
  },
  {
    id: '3',
    type: 'delegation_request',
    title: 'Demande de délégation',
    description: 'Ahmed Benali souhaite vous déléguer la tâche "Jury Certification". Acceptez-vous?',
    timestamp: 'Il y a 17 h',
    status: 'read'
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Rappel: Réponse attendue',
    description: 'Vous avez 12 heures pour répondre à l\'affectation de la tâche "Conception Évaluation".',
    timestamp: 'Il y a 20 h',
    status: 'read'
  },
  {
    id: '5',
    type: 'task_accepted',
    title: 'Tâche acceptée',
    description: 'Votre acceptation de la tâche "Formation Soft Skills" a été enregistrée.',
    timestamp: 'Il y a 1 j',
    status: 'read'
  }
];

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.status === 'unread';
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'read' as NotificationStatus })));
  };

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

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
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
    </div>
  );
}
