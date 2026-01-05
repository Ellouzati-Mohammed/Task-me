const express = require('express');
const router = express.Router();
const Notification = require('../models/NotificationModel');

// ✅ Récupérer toutes les notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().populate('utilisateur');
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
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
router.put('/:id', async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ success: false, message: 'Notification introuvable' });
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
