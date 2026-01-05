export type NotificationType = 'task_assigned' | 'task_modified' | 'delegation_request' | 'reminder' | 'task_accepted' | 'task_rejected';

export type NotificationStatus = 'read' | 'unread';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  status: NotificationStatus;
}

export interface NotificationTypeConfig {
  icon: string;
  iconColor: string;
  backgroundColor: string;
}
