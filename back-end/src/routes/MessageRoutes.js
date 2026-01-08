const express = require('express');
const router = express.Router();
const Message = require('../models/MessageModel');
const Chat = require('../models/ChatModel');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Récupérer les messages d'une conversation
router.get('/conversation/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Vérifier que la conversation existe et que l'utilisateur en fait partie
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Conversation introuvable' });
    }
    
    // Vérifier que l'utilisateur connecté est un participant de cette conversation
    const isParticipant = chat.participants.some(
      participantId => participantId.toString() === req.user._id.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé à cette conversation' });
    }
    
    // Récupérer les messages de cette conversation, triés par date (plus anciens en premier)
    const messages = await Message.find({ conversation: chatId })
      .populate('expediteur', 'nom prenom email role')
      .sort({ createdAt: 1 }); // Tri croissant par date de création
    
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Erreur récupération messages conversation:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération messages', error: error.message });
  }
});

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
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { contenu, conversation, piecesJointes } = req.body;
    
    // Vérifier que la conversation existe
    const chat = await Chat.findById(conversation);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Conversation introuvable' });
    }
    
    // Vérifier que l'utilisateur fait partie de la conversation
    const isParticipant = chat.participants.some(
      participantId => participantId.toString() === req.user._id.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Vous ne faites pas partie de cette conversation' });
    }
    
    // Créer le message
    const newMessage = new Message({
      contenu,
      conversation,
      expediteur: req.user._id,
      piecesJointes: piecesJointes || []
    });
    
    await newMessage.save();
    
    // Mettre à jour la date de dernière modification de la conversation
    await Chat.findByIdAndUpdate(conversation, { updatedAt: new Date() });
    
    // Populer les informations avant de renvoyer
    await newMessage.populate('expediteur', 'nom prenom email role');
    
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Erreur création message:', error);
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
