const express = require('express');
const router = express.Router();
const Notification = require('../models/NotificationModel');
const { authMiddleware } = require('../middlewares/auth.middleware');

// ✅ Compter les notifications non lues pour un utilisateur
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      utilisateur: req.user.id,
      lue: false
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur comptage notifications', error: error.message });
  }
});

// ✅ Récupérer toutes les notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📬 Récupération notifications pour userId:', req.user.id);
    
    // Temporaire : vérifier toutes les notifications en DB
    const allNotifications = await Notification.find();
    console.log('🔍 Total notifications en DB:', allNotifications.length);
    console.log('🔍 Notifications en DB:', allNotifications.map(n => ({ user: n.utilisateur, message: n.message })));
    
    const notifications = await Notification.find({ utilisateur: req.user.id })
      .sort({ createdAt: -1 })
      .populate('utilisateur');
    console.log('✅ Notifications trouvées pour cet user:', notifications.length);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération notifications', error: error.message });
  }
});

// ✅ Récupérer une notification par ID
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('utilisateur');
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification introuvable' });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur récupération notification', error: error.message });
  }
});

// ✅ Créer une nouvelle notification
router.post('/', async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    await newNotification.save();
    res.status(201).json({ success: true, data: newNotification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur création notification', error: error.message });
  }
});

// ✅ Mettre à jour une notification
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('utilisateur');
    
    if (!updatedNotification) {
      return res.status(404).json({ success: false, message: 'Notification introuvable' });
    }
    
    // Si on marque comme lue, mettre à jour le compteur dans Navbar via Socket.IO
    if (req.body.lue === true) {
      const unreadCount = await Notification.countDocuments({
        utilisateur: updatedNotification.utilisateur._id,
        lue: false
      });
      
      // Émettre le nouveau compteur à l'utilisateur
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      
      if (userSockets && userSockets.has(updatedNotification.utilisateur._id.toString())) {
        const socketId = userSockets.get(updatedNotification.utilisateur._id.toString());
        io.to(socketId).emit('unreadCountUpdate', { count: unreadCount });
      }
    }
    
    res.json({ success: true, data: updatedNotification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur mise à jour notification', error: error.message });
  }
});

// ✅ Supprimer une notification
router.delete('/:id', async (req, res) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
    if (!deletedNotification) {
      return res.status(404).json({ success: false, message: 'Notification introuvable' });
    }
    res.json({ success: true, message: 'Notification supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur suppression notification', error: error.message });
  }
});

module.exports = router;
