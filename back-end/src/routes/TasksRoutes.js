const express = require('express');
const router = express.Router();
const Task = require('../models/TaskModel');
const User = require('../models/UsersModel');
const Affectation = require('../models/AffectationModel');

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
router.post('/', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    console.log(newTask)
    console.log(req.body)
    await newTask.save();
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.log(error)
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
