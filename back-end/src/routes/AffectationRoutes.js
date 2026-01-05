const express = require('express');
const router = express.Router();
const Affectation = require('../models/AffectationModel');

// CRUD Affectations
router.get('/', async (req, res) => {
  try {
    const Affectations = await Affectation.find().populate('tache auditeur');
    res.json({ success: true, data: Affectations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération affectations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newAffectation = new Affectation(req.body);
    await newAffectation.save();
    res.status(201).json({ success: true, data: newAffectation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur création affectation' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedAffectation = await Affectation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAffectation) return res.status(404).json({ success: false, message: 'Affectation introuvable' });
    res.json({ success: true, data: updatedAffectation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour affectation' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedAffectation = await Affectation.findByIdAndDelete(req.params.id);
    if (!deletedAffectation) return res.status(404).json({ success: false, message: 'Affectation introuvable' });
    res.json({ success: true, message: 'Affectation supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression affectation' });
  }
});

module.exports = router;
