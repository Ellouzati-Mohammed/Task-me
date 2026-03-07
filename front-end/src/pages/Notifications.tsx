import {
  ClipboardList,
  AlertCircle,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import '../Styles/Notifications.css';
import type { Notification, NotificationStatus, NotificationType } from '../types/Notification.d';
import { getSocket } from '../services/socket';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  // Charger les notifications depuis l'API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notifications');
        if (response.data.success) {
          const apiNotifications = response.data.data.map((notif: any) => ({
            id: notif._id,
            type: 'task_assigned' as NotificationType,
            title: notif.typeNotification === 'AFFECTATION' ? 'Nouvelle affectation' : 'Notification',
            description: notif.message,
            timestamp: new Date(notif.date).toLocaleDateString('fr-FR'),
            status: notif.lue ? 'read' as NotificationStatus : 'unread' as NotificationStatus
          }));
          setNotifications(apiNotifications);
        }
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Écouter les notifications en temps réel via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    
    if (socket) {
      socket.on('notification', (notification: any) => {
        console.log('📬 Nouvelle notification reçue:', notification);
        
        const newNotif: Notification = {
          id: notification._id,
          type: 'task_assigned',
          title: notification.type === 'AFFECTATION' ? 'Nouvelle affectation' : 'Notification',
          description: notification.message,
          timestamp: 'À l\'instant',
          status: 'unread'
        };
        
        setNotifications(prev => [newNotif, ...prev]);
        
        // Afficher une notification native du navigateur
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotif.title, {
            body: newNotif.description,
            icon: '/logo.png'
          });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, []);

  // Demander la permission pour les notifications natives
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.status === 'unread';
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const markAllAsRead = async () => {
    try {
      // Mettre à jour toutes les notifications non lues
      const unreadIds = notifications.filter(n => n.status === 'unread').map(n => n.id);
      
      for (const id of unreadIds) {
        await api.put(`/notifications/${id}`, { lue: true });
      }
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(n => ({ ...n, status: 'read' as NotificationStatus })));
    } catch (error) {
      console.error('Erreur marquage notifications comme lues:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}`, { lue: true });
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, status: 'read' as NotificationStatus } : n
      ));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
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
