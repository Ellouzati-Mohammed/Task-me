const express = require('express');
const router = express.Router();
const User = require('../models/UsersModel');

// Créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur création utilisateur' });
  }
});

// Lister tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération utilisateurs' });
  }
});

// Récupérer un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération utilisateur' });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour utilisateur' });
  }
});

// Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression utilisateur' });
  }
});

module.exports = router;
