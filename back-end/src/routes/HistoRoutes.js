const express = require('express');
const router = express.Router();
const History = require('../models/HistoryModel');

// Historique global
router.get('/', async (req, res) => {
  try {
    const history = await History.find().populate('auditeur tâche');
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération historique global' });
  }
});

// Historique individuel par utilisateur
router.get('/user/:id', async (req, res) => {
  try {
    const history = await History.find({ auditeur: req.params.id }).populate('tache');
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération historique utilisateur' });
  }
});

// Ajouter une entrée dans l’historique
router.post('/', async (req, res) => {
  try {
    const newHistory = new History(req.body);
    await newHistory.save();
    res.status(201).json({ success: true, data: newHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur ajout historique' });
  }
});

module.exports = router;
