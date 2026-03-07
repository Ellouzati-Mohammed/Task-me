/**
 * Service de notifications en temps réel avec Socket.IO
 */

function emitNotification(app, userId, notification) {
  try {
    const io = app.get('io');
    const userSockets = app.get('userSockets');
    
    if (!io || !userSockets) {
      console.log('⚠️ Socket.IO non disponible');
      return;
    }

    const socketId = userSockets.get(userId.toString());
    
    if (socketId) {
      io.to(socketId).emit('notification', notification);
      console.log(`✅ Notification envoyée à l'utilisateur ${userId}`);
    } else {
      console.log(`⚠️ Utilisateur ${userId} non connecté`);
    }
  } catch (error) {
    console.error('❌ Erreur émission notification:', error);
  }
}

function emitNotificationToAll(app, notification) {
  try {
    const io = app.get('io');
    
    if (!io) {
      console.log('⚠️ Socket.IO non disponible');
      return;
    }

    io.emit('notification', notification);
    console.log('✅ Notification envoyée à tous les utilisateurs');
  } catch (error) {
    console.error('❌ Erreur émission notification broadcast:', error);
  }
}

module.exports = {
  emitNotification,
  emitNotificationToAll
};
