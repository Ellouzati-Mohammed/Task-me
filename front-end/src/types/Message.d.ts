export type UserStatus = 'online' | 'offline' | 'away';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: UserStatus;
  messages: Message[];
}
