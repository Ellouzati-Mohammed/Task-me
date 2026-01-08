const express = require('express');
const router = express.Router();
const Chat = require('../models/ChatModel');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Récupérer tous les Chats d'une conversation
router.get('/', async (req, res) => {
    try {
      const chats = await Chat.find().populate('participants');
      res.json({ success: true, data: chats });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Erreur récupération Chats', error: error.message });
    }
  });

// Récupérer les conversations de l'utilisateur connecté
router.get('/my-conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'nom prenom email role')
    .sort({ updatedAt: -1 });
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération de vos conversations' });
  }
});
  

// Créer un nouveau Chat entre l'utilisateur connecté et un autre utilisateur
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    
    // Vérifier que l'autre utilisateur est fourni
    if (!otherUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'L\'ID de l\'autre utilisateur est requis' 
      });
    }
    
    // Vérifier si un chat existe déjà entre ces deux utilisateurs
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, otherUserId] }
    });
    
    if (existingChat) {
      // Populate avant de retourner
      await existingChat.populate('participants', 'nom prenom email role');
      return res.json({ 
        success: true, 
        data: existingChat,
        message: 'Chat déjà existant' 
      });
    }
    
    // Créer un nouveau chat avec l'utilisateur connecté et l'autre utilisateur
    const newChat = new Chat({
      participants: [req.user._id, otherUserId]
    });
    
    await newChat.save();
    
    // Populate pour retourner les infos complètes
    await newChat.populate('participants', 'nom prenom email role');
    
    res.status(201).json({ success: true, data: newChat });
  } catch (error) {
    console.error('Erreur création chat détaillée:', error);
    res.status(500).json({ success: false, message: 'Erreur création Chat', error: error.message });
  }
});

// Mettre à jour un Chat
router.put('/:id', async (req, res) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedChat ) return res.status(404).json({ success: false, Chat: 'Chat introuvable' });
    res.json({ success: true, data: updatedChat });
  } catch (error) {
    res.status(500).json({ success: false, Chat: 'Erreur mise à jour Chat' });
  }
});

// Supprimer un Chat
router.delete('/:id', async (req, res) => {
  try {
    const deletedChat = await Chat.findByIdAndDelete(req.params.id);
    if (!deletedChat) return res.status(404).json({ success: false, Chat: 'Chat introuvable' });
    res.json({ success: true, Chat: 'Chat supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, Chat: 'Erreur suppression Chat' });
  }
});

module.exports = router;
