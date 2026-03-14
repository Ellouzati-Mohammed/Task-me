import { Search, Plus, MoreVertical, Send } from 'lucide-react';
import '../Styles/Messages.css';
import { useMessages } from '../hooks/useMessages';



export function Messages() {
  const {
    conversations,
    loading,
    loadingMessages,
    activeConversation,
    setActiveConversation,
    activeConversationType,
    setActiveConversationType,
    searchQuery,
    setSearchQuery,
    messageInput,
    setMessageInput,
    filteredConversations,
    handleSendMessage,
  } = useMessages();

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
