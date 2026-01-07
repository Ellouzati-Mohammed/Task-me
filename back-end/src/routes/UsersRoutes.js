const express = require('express');
const router = express.Router();
const User = require('../models/UsersModel');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

// Créer un utilisateur (admin seulement)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    // Mapper dateInscription vers dateembauche si présent
    const userData = { ...req.body };
    if (userData.dateInscription) {
      userData.dateembauche = userData.dateInscription;
      delete userData.dateInscription;
    }
    
    const user = new User(userData);
    console.log(user);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Erreur création utilisateur' });
  }
});

// Lister tous les utilisateurs (authentification requise)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération utilisateurs' });
  }
});

// Récupérer un utilisateur par ID (authentification requise)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération utilisateur' });
  }
});

// Mettre à jour un utilisateur (admin seulement)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour utilisateur' });
  }
});
// Mettre à jour son propre profil (utilisateur connecté)
router.put('/profile/me', authMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-motdePasse');
    if (!updatedUser) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Erreur mise à jour utilisateur' });
  }
});

// Changer le mot de passe (utilisateur connecté)
router.put('/profile/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Vérifier que les champs sont fournis
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.motdePasse = newPassword;
    await user.save(); // Le middleware pre-save va hacher le nouveau mot de passe

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe'
    });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    console.err(error);
    res.status(500).json({ success: false, message: 'Erreur suppression utilisateur' });
  }
});

module.exports = router;
