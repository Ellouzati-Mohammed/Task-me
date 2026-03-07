const express = require('express');
const router = express.Router();
const User = require('../models/UsersModel');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

// Créer un utilisateur (admin seulement)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
    
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
    console.log(error);
    // Vérifier si c'est une erreur de validation MongoDB
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    // Vérifier si c'est une erreur de duplicata (email unique)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
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

// Récupérer uniquement les auditeurs (authentification requise)
router.get('/auditeurs/list', authMiddleware, async (req, res) => {
  try {
    const auditeurs = await User.find({ role: 'auditeur', actif: true });
    res.json({ success: true, data: auditeurs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération auditeurs' });
  }
});

// Récupérer les statistiques de l'utilisateur connecté
router.get('/me/stats', authMiddleware, async (req, res) => {
  try {
    const Affectation = require('../models/AffectationModel');
    const Task = require('../models/TaskModel');
    
    let stats = {};
    
    // Statistiques selon le rôle
    if (req.user.role === 'auditeur') {
      // Statistiques pour les auditeurs
      const totalAffectations = await Affectation.countDocuments({ 
        auditeur: req.user._id 
      });
      
      const acceptedTasks = await Affectation.countDocuments({ 
        auditeur: req.user._id,
        statutAffectation: 'ACCEPTEE'
      });
      
      const refusedTasks = await Affectation.countDocuments({ 
        auditeur: req.user._id,
        statutAffectation: 'REFUSEE'
      });
      
      const delegatedTasks = await Affectation.countDocuments({ 
        auditeur: req.user._id,
        statutAffectation: 'DELEGUEE'
      });
      
      const pendingTasks = await Affectation.countDocuments({ 
        auditeur: req.user._id,
        statutAffectation: 'PROPOSEE'
      });
      
      stats = {
        totalAffectations,
        acceptedTasks,
        refusedTasks,
        delegatedTasks,
        pendingTasks,
        completedTasks: 0
      };
    } else if (req.user.role === 'coordinateur' || req.user.role === 'admin') {
      // Statistiques pour les coordinateurs et admins
      const totalTasks = await Task.countDocuments({ coordinateur: req.user._id });
      const pendingTasks = await Task.countDocuments({ 
        coordinateur: req.user._id,
        statutTache: { $in: ['CREEE', 'EN_AFFECTATION'] } 
      });
      const completedTasks = await Task.countDocuments({ 
        coordinateur: req.user._id,
        statutTache: 'TERMINEE' 
      });
      const inProgressTasks = await Task.countDocuments({ 
        coordinateur: req.user._id,
        statutTache: 'EN_COURS' 
      });
      
      stats = {
        totalTasks,
        pendingTasks,
        completedTasks,
        inProgressTasks
      };
    }
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Erreur récupération statistiques utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération de vos statistiques' });
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
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (req.body.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé' 
        });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.log(error);
    // Vérifier si c'est une erreur de validation MongoDB
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    // Vérifier si c'est une erreur de duplicata
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
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
