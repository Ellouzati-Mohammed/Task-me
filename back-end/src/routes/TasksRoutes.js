const express = require('express');
const router = express.Router();
const Task = require('../models/TaskModel');

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
    await newTask.save();
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
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
