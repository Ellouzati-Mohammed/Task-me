const express = require('express');
const router = express.Router();
const Message = require('../models/MessageModel');

//Récupérer tous les messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('conversation')   // pour avoir les infos du chat
      .populate('expediteur');    // pour avoir les infos de l’expéditeur (User)
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur récupération messages', error: error.message });
  }
});

//Récupérer un message par ID
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('conversation')
      .populate('expediteur');
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message introuvable' });
    }
    res.json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur récupération message', error: error.message });
  }
});

//Créer un nouveau message
router.post('/', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur création message', error: error.message });
  }
});

//Mettre à jour un message
router.put('/:id', async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({ success: false, message: 'Message introuvable' });
    }
    res.json({ success: true, data: updatedMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur mise à jour message', error: error.message });
  }
});

// Supprimer un message
router.delete('/:id', async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      return res.status(404).json({ success: false, message: 'Message introuvable' });
    }
    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur suppression message', error: error.message });
  }
});

module.exports = router;
