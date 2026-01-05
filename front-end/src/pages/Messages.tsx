import { useState } from 'react';
import { Search, Plus, MoreVertical, Send } from 'lucide-react';
import '../Styles/Messages.css';
import type { Conversation } from '../types/Message.d';

const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: 'ab',
    userName: 'Ahmed Benali',
    initials: 'AB',
    lastMessage: 'D\'accord pour la réunion de ...',
    timestamp: '10:30',
    unreadCount: 2,
    status: 'online',
    messages: [
      { id: '1', senderId: 'ab', text: 'Bonjour! Comment allez-vous?', timestamp: '10:00', isOwn: false },
      { id: '2', senderId: 'me', text: 'Bonjour Ahmed! Je vais bien, merci. Et vous?', timestamp: '10:05', isOwn: true },
      { id: '3', senderId: 'ab', text: 'Très bien! Je voulais discuter de la tâche de formation React.', timestamp: '10:10', isOwn: false },
      { id: '4', senderId: 'me', text: 'Oui, bien sûr. Je suis disponible pour en parler.', timestamp: '10:15', isOwn: true },
      { id: '5', senderId: 'ab', text: 'Parfait! On peut se retrouver demain à 14h?', timestamp: '10:20', isOwn: false }
    ]
  },
  {
    id: '2',
    userId: 'fz',
    userName: 'Fatima Zahra',
    initials: 'FZ',
    lastMessage: 'Merci pour les documents',
    timestamp: '09:15',
    unreadCount: 0,
    status: 'online',
    messages: [
      { id: '1', senderId: 'fz', text: 'Bonjour! Avez-vous les documents pour l\'audit?', timestamp: '09:00', isOwn: false },
      { id: '2', senderId: 'me', text: 'Oui, je vous les envoie tout de suite.', timestamp: '09:10', isOwn: true },
      { id: '3', senderId: 'fz', text: 'Merci pour les documents', timestamp: '09:15', isOwn: false }
    ]
  },
  {
    id: '3',
    userId: 'yb',
    userName: 'Youssef Bennani',
    initials: 'YB',
    lastMessage: 'La tâche a été validée',
    timestamp: 'Hier',
    unreadCount: 0,
    status: 'offline',
    messages: [
      { id: '1', senderId: 'yb', text: 'Bonjour, j\'ai terminé la planification.', timestamp: 'Hier 15:00', isOwn: false },
      { id: '2', senderId: 'me', text: 'Parfait, merci!', timestamp: 'Hier 15:30', isOwn: true },
      { id: '3', senderId: 'yb', text: 'La tâche a été validée', timestamp: 'Hier 16:00', isOwn: false }
    ]
  },
  {
    id: '4',
    userId: 'si',
    userName: 'Sara Idrissi',
    initials: 'SI',
    lastMessage: 'Pouvez-vous confirmer?',
    timestamp: 'Hier',
    unreadCount: 1,
    status: 'online',
    messages: [
      { id: '1', senderId: 'si', text: 'Bonjour! Pour la formation demain.', timestamp: 'Hier 14:00', isOwn: false },
      { id: '2', senderId: 'me', text: 'Oui, je confirme ma présence.', timestamp: 'Hier 14:30', isOwn: true },
      { id: '3', senderId: 'si', text: 'Pouvez-vous confirmer?', timestamp: 'Hier 15:00', isOwn: false }
    ]
  },
  {
    id: '5',
    userId: 'ke',
    userName: 'Karim El Amrani',
    initials: 'KE',
    lastMessage: 'Bien reçu',
    timestamp: 'Lun',
    unreadCount: 0,
    status: 'online',
    messages: [
      { id: '1', senderId: 'ke', text: 'Les documents sont prêts.', timestamp: 'Lun 11:00', isOwn: false },
      { id: '2', senderId: 'me', text: 'Parfait, merci beaucoup!', timestamp: 'Lun 11:15', isOwn: true },
      { id: '3', senderId: 'ke', text: 'Bien reçu', timestamp: 'Lun 11:20', isOwn: false }
    ]
  }
];

export function Messages() {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(conversations[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="messages-page">
      {/* Conversations Sidebar */}
      <div className="conversations-sidebar">
        <div className="conversations-header">
          <h2 className="conversations-title">Conversations</h2>
          <button className="new-conversation-btn">
            <Plus size={18} />
          </button>
        </div>

        <div className="conversations-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
              onClick={() => setActiveConversation(conversation)}
            >
              <div className="conversation-avatar-wrapper">
                <div className="conversation-avatar">
                  {conversation.initials}
                </div>
                {conversation.status === 'online' && <span className="status-indicator online"></span>}
              </div>
              
              <div className="conversation-info">
                <div className="conversation-header-row">
                  <span className="conversation-name">{conversation.userName}</span>
                  <span className="conversation-time">{conversation.timestamp}</span>
                </div>
                <div className="conversation-preview-row">
                  <p className="conversation-preview">{conversation.lastMessage}</p>
                  {conversation.unreadCount > 0 && (
                    <span className="unread-badge">{conversation.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">{activeConversation.initials}</div>
                <div>
                  <h3 className="chat-user-name">{activeConversation.userName}</h3>
                  {activeConversation.status === 'online' && (
                    <span className="chat-user-status">En ligne</span>
                  )}
                </div>
              </div>
              <button className="chat-menu-btn">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="chat-messages">
              {activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isOwn ? 'own' : 'other'}`}
                >
                  <div className="message-bubble">
                    <p className="message-text">{message.text}</p>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="Écrivez votre message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="send-btn" onClick={handleSendMessage}>
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
