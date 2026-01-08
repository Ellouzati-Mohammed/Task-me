import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../Styles/Messages.css';
import api from '../services/api';
import type { Conversation } from '../types/Message.d';

interface ChatParticipant {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface ApiConversation {
  _id: string;
  participants: ChatParticipant[];
  createdAt: string;
  updatedAt: string;
}

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
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  // Récupérer les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation?.id]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chats/my-conversations');
      const apiConversations = response.data.data || [];
      
      // Mapper les conversations de l'API au format attendu
      const mappedConversations: Conversation[] = apiConversations.map((conv: ApiConversation) => {
        // Trouver l'autre participant (pas l'utilisateur connecté)
        const otherParticipant = conv.participants.find(p => p._id !== user?.id);
        
        if (!otherParticipant) {
          return null;
        }
        
        const initials = `${otherParticipant.prenom.charAt(0)}${otherParticipant.nom.charAt(0)}`.toUpperCase();
        const userName = `${otherParticipant.prenom} ${otherParticipant.nom}`;
        
        return {
          id: conv._id,
          userId: otherParticipant._id,
          userName,
          initials,
          lastMessage: '',
          timestamp: new Date(conv.updatedAt).toLocaleDateString('fr-FR'),
          unreadCount: 0,
          status: 'offline',
          messages: []
        };
      }).filter(Boolean) as Conversation[];
      
      setConversations(mappedConversations);
      
      // Sélectionner la première conversation par défaut
      if (mappedConversations.length > 0) {
        setActiveConversation(mappedConversations[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const response = await api.get(`/messages/conversation/${chatId}`);
      const apiMessages = response.data.data || [];
      
      // Mapper les messages de l'API au format attendu
      const mappedMessages = apiMessages.map((msg: any) => ({
        id: msg._id,
        senderId: msg.expediteur._id,
        text: msg.contenu,
        timestamp: new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isOwn: msg.expediteur._id === user?.id
      }));

      // Mettre à jour la conversation active avec les messages
      setActiveConversation(prev => {
        if (prev && prev.id === chatId) {
          return {
            ...prev,
            messages: mappedMessages
          };
        }
        return prev;
      });

      // Mettre à jour aussi dans la liste des conversations
      setConversations(prevConvs => 
        prevConvs.map(conv => 
          conv.id === chatId 
            ? { 
                ...conv, 
                messages: mappedMessages,
                lastMessage: mappedMessages.length > 0 
                  ? mappedMessages[mappedMessages.length - 1].text 
                  : ''
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (messageInput.trim() && activeConversation) {
      try {
        const response = await api.post('/messages', {
          contenu: messageInput.trim(),
          conversation: activeConversation.id
        });

        const newMessage = response.data.data;
        
        // Mapper le nouveau message au format local
        const mappedMessage = {
          id: newMessage._id,
          senderId: newMessage.expediteur._id,
          text: newMessage.contenu,
          timestamp: new Date(newMessage.createdAt).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOwn: true
        };

        // Ajouter le message à la conversation active
        setActiveConversation(prev => {
          if (prev) {
            return {
              ...prev,
              messages: [...prev.messages, mappedMessage],
              lastMessage: mappedMessage.text
            };
          }
          return prev;
        });

        // Mettre à jour aussi dans la liste des conversations
        setConversations(prevConvs => 
          prevConvs.map(conv => 
            conv.id === activeConversation.id 
              ? { 
                  ...conv, 
                  messages: [...conv.messages, mappedMessage],
                  lastMessage: mappedMessage.text,
                  timestamp: 'Maintenant'
                }
              : conv
          )
        );

        setMessageInput('');
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
      }
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

        {loading ? (
          <div className="conversations-list">
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
              Chargement des conversations...
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="conversations-list">
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
              Aucune conversation
            </div>
          </div>
        ) : (
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
        )}
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
              {loadingMessages ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: '#64748b' 
                }}>
                  Chargement des messages...
                </div>
              ) : activeConversation.messages.length === 0 ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: '#64748b' 
                }}>
                  Aucun message. Commencez la conversation!
                </div>
              ) : (
                activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.isOwn ? 'own' : 'other'}`}
                  >
                    <div className="message-bubble">
                      <p className="message-text">{message.text}</p>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
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
