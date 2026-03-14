import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Conversation, ApiConversation, ApiMessage } from '../types/Message.d';

export function useMessages() {
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

      const mappedConversations: Conversation[] = apiConversations
        .map((conv: ApiConversation) => {
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
              conversationType: 'GoupeTACHE' as const,
            };
          }

          const otherParticipant = conv.participants.find((p) => p._id !== user?.id);
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
            conversationType: 'PRIVE' as const,
          };
        })
        .filter(Boolean) as Conversation[];

      setConversations(mappedConversations);

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

      const mappedMessages = apiMessages.map((msg: ApiMessage) => ({
        id: msg._id,
        senderId: msg.expediteur._id,
        senderName: `${msg.expediteur.prenom} ${msg.expediteur.nom}`,
        text: msg.contenu,
        timestamp: new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOwn: msg.expediteur._id === user?.id,
      }));

      setActiveConversation((prev) => {
        if (prev && prev.id === chatId) {
          return {
            ...prev,
            messages: mappedMessages,
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

  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!(messageInput.trim() && activeConversation)) {
      return;
    }

    try {
      const response = await api.post('/messages', {
        contenu: messageInput.trim(),
        conversation: activeConversation.id,
      });

      const newMessage = response.data.data;

      const mappedMessage = {
        id: newMessage._id,
        senderId: newMessage.expediteur._id,
        text: newMessage.contenu,
        timestamp: new Date(newMessage.createdAt).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOwn: true,
      };

      setActiveConversation((prev) => {
        if (prev) {
          return {
            ...prev,
            messages: [...prev.messages, mappedMessage],
            lastMessage: mappedMessage.text,
          };
        }
        return prev;
      });

      setConversations((prevConvs) =>
        prevConvs.map((conv) =>
          conv.id === activeConversation.id
            ? {
                ...conv,
                messages: [...conv.messages, mappedMessage],
                lastMessage: mappedMessage.text,
                timestamp: 'Maintenant',
              }
            : conv
        )
      );

      setMessageInput('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  return {
    user,
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
  };
}
