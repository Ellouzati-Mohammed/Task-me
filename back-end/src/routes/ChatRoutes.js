const express = require('express');
const router = express.Router();
const Chat = require('../models/ChatModel');

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
  

// Créer un nouveau Chat
router.post('/', async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    await newChat.save();
    res.status(201).json({ success: true, data: newChat });
  } catch (error) {
    res.status(500).json({ success: false, Chat: 'Erreur création Chat' });
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
