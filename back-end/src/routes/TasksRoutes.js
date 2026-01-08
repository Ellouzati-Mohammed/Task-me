const express = require('express');
const router = express.Router();
const Task = require('../models/TaskModel');
const User = require('../models/UsersModel');
const Affectation = require('../models/AffectationModel');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Récupérer les statistiques du dashboard
router.get('/stats', async (req, res) => {
  try {
    // Compter les tâches par statut
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ 
      statutTache: { $in: ['CREEE', 'EN_AFFECTATION'] } 
    });
    const completedTasks = await Task.countDocuments({ statutTache: 'TERMINEE' });
    const inProgressTasks = await Task.countDocuments({ statutTache: 'EN_COURS' });
    const assignedTasks = await Task.countDocuments({ statutTache: 'COMPLETEE_AFFECTEE' });
    const cancelledTasks = await Task.countDocuments({ statutTache: 'ANNULEE' });
    
    // Compter les auditeurs actifs
    const activeAuditors = await User.countDocuments({ role: 'auditeur' });
    
    // Calculer le taux d'acceptation
    const totalAffectations = await Affectation.countDocuments();
    const acceptedAffectations = await Affectation.countDocuments({ statutAffectation: 'ACCEPTEE' });
    const acceptanceRate = totalAffectations > 0 
      ? Math.round((acceptedAffectations / totalAffectations) * 100) 
      : 0;
    
    res.json({ 
      success: true, 
      data: {
        totalTasks,
        pendingTasks,
        completedTasks,
        inProgressTasks,
        assignedTasks,
        cancelledTasks,
        activeAuditors,
        acceptanceRate
      }
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du calcul des statistiques' });
  }
});

// Récupérer toutes les tâches
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des tâches' });
  }
});

// Récupérer les tâches de l'utilisateur connecté
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    // Récupérer les tâches créées par l'utilisateur connecté (coordinateur)
    const tasks = await Task.find({ coordinateur: req.user._id });
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Erreur récupération tâches utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de vos tâches' });
  }
});

// Récupérer les tâches d'un utilisateur spécifique
router.get('/user/:userId', async (req, res) => {
  try {
    // Récupérer toutes les affectations de l'utilisateur
    const affectations = await Affectation.find({ auditeur: req.params.userId }).select('tache');
    
    // Extraire les IDs des tâches
    const taskIds = affectations.map(aff => aff.tache);
    
    // Récupérer les tâches correspondantes
    const tasks = await Task.find({ _id: { $in: taskIds } });
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Erreur récupération tâches utilisateur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des tâches de l\'utilisateur' });
  }
});

// Récupérer une tâche par ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la tâche' });
  }
});

// Créer une nouvelle tâche
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Ajouter automatiquement le coordinateur (l'utilisateur connecté)
    const taskData = {
      ...req.body,
      coordinateur: req.user._id
    };
    
    const newTask = new Task(taskData);
    console.log(newTask);
    console.log(req.body);
    await newTask.save();
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la tâche' });
  }
});

// Mettre à jour une tâche
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la tâche' });
  }
});

// Changer le statut d'une tâche
router.patch('/:id/status', async (req, res) => {
  try {
    const { statutTache } = req.body;
    
    // Valider le statut
    const validStatuses = ['CREEE', 'EN_AFFECTATION', 'COMPLETEE_AFFECTEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];
    if (!statutTache || !validStatuses.includes(statutTache)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Statut invalide. Statuts autorisés: ' + validStatuses.join(', ')
      });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { statutTache },
      { new: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }
    
    res.json({ success: true, data: updatedTask, message: 'Statut mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du changement de statut' });
  }
});

// Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    res.json({ success: true, message: 'Tâche supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la tâche' });
  }
});

module.exports = router;
