export type UserStatus = 'online' | 'offline' | 'away';

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
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
  isGroup?: boolean;
  conversationType?: 'GoupeTACHE' | 'PRIVE';
}

export interface ChatParticipant {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export interface ApiConversation {
  _id: string;
  participants: ChatParticipant[];
  titre?: string;
  conversation: 'GoupeTACHE' | 'PRIVE';
  tache?: {
    _id: string;
    nom: string;
  };
  createdAt: string;
  updatedAt: string;
}
