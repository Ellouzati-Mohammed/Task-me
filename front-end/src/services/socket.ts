import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (userId: string): Socket => {
  if (socket) {
    return socket;
  }

  socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('✅ Socket.IO connecté:', socket?.id);
    // Enregistrer l'utilisateur
    socket?.emit('register', userId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket.IO déconnecté');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Erreur connexion Socket.IO:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket.IO déconnecté manuellement');
  }
};
