import { useEffect, useState } from 'react';
import type { Notification, NotificationStatus, NotificationType } from '../types/Notification.d';
import { getSocket } from '../services/socket';
import api from '../services/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notifications');
        if (response.data.success) {
          const apiNotifications = response.data.data.map((notif: Record<string, unknown>) => ({
            id: notif._id as string,
            type: 'task_assigned' as NotificationType,
            title: notif.typeNotification === 'AFFECTATION' ? 'Nouvelle affectation' : 'Notification',
            description: notif.message as string,
            timestamp: new Date(notif.date as string).toLocaleDateString('fr-FR'),
            status: notif.lue ? ('read' as NotificationStatus) : ('unread' as NotificationStatus),
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

  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      socket.on('notification', (notification: Record<string, unknown>) => {
        console.log('Nouvelle notification reçue:', notification);

        const newNotif: Notification = {
          id: notification._id as string,
          type: 'task_assigned',
          title: notification.type === 'AFFECTATION' ? 'Nouvelle affectation' : 'Notification',
          description: notification.message as string,
          timestamp: "À l'instant",
          status: 'unread',
        };

        setNotifications((prev) => [newNotif, ...prev]);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotif.title, {
            body: newNotif.description,
            icon: '/logo.png',
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

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true;
    return notif.status === 'unread';
  });

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => n.status === 'unread').map((n) => n.id);

      for (const id of unreadIds) {
        await api.put(`/notifications/${id}`, { lue: true });
      }

      setNotifications(notifications.map((n) => ({ ...n, status: 'read' as NotificationStatus })));
    } catch (error) {
      console.error('Erreur marquage notifications comme lues:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}`, { lue: true });

      setNotifications(notifications.map((n) =>
        n.id === notificationId ? { ...n, status: 'read' as NotificationStatus } : n
      ));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  };

  return {
    notifications,
    filter,
    setFilter,
    loading,
    filteredNotifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
  };
}
