import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../Styles/Messages.css';
import api from '../services/api';
import type { Conversation, ApiConversation, ApiMessage } from '../types/Message.d';



export function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeConversationType, setActiveConversationType] = useState<'GoupeTACHE' | 'PRIVE'>('PRIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chats/my-conversations');
      const apiConversations = response.data.data || [];
      
      // Mapper les conversations de l'API au format attendu
      const mappedConversations: Conversation[] = apiConversations.map((conv: ApiConversation) => {
        // Pour les conversations de groupe
        if (conv.conversation === 'GoupeTACHE') {
          const title = conv.titre || conv.tache?.nom || 'Groupe';
          const initials = title.substring(0, 2).toUpperCase();
          
          return {
            id: conv._id,
            userId: 'group',
            userName: title,
            initials,
            lastMessage: '',
            timestamp: new Date(conv.updatedAt).toLocaleDateString('fr-FR'),
            unreadCount: 0,
            status: 'offline' as const,
            messages: [],
            isGroup: true,
            conversationType: 'GoupeTACHE' as const
          };
        }
        
        // Pour les conversations privées
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
          status: 'offline' as const,
          messages: [],
          conversationType: 'PRIVE' as const
        };
      }).filter(Boolean) as Conversation[];
      
      setConversations(mappedConversations);
      
      // Sélectionner la première conversation par défaut
      if (mappedConversations.length > 0) {
        setActiveConversation(mappedConversations[0]);
        setActiveConversationType(mappedConversations[0].conversationType || 'PRIVE');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const response = await api.get(`/messages/conversation/${chatId}`);
      const apiMessages = response.data.data || [];
      
      // Mapper les messages de l'API au format attendu
      const mappedMessages = apiMessages.map((msg: ApiMessage) => ({
        id: msg._id,
        senderId: msg.expediteur._id,
        senderName: `${msg.expediteur.prenom} ${msg.expediteur.nom}`,
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
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Récupérer les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

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
              onClick={() => {
                setActiveConversation(conversation);
                setActiveConversationType(conversation.conversationType || 'PRIVE');
              }}
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
                      {activeConversationType === 'GoupeTACHE' && !message.isOwn && (
                        <div className="message-sender-name">{message.senderName}</div>
                      )}
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
