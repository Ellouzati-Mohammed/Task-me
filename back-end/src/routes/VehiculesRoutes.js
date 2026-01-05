const express = require('express');
const router = express.Router();
const Vehicle = require('../models/VehicleModel');

// CRUD Véhicules
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération véhicules' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.status(201).json({ success: true, data: newVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur création véhicule' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVehicle) return res.status(404).json({ success: false, message: 'Véhicule introuvable' });
    res.json({ success: true, data: updatedVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour véhicule' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) return res.status(404).json({ success: false, message: 'Véhicule introuvable' });
    res.json({ success: true, message: 'Véhicule supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression véhicule' });
  }
});

module.exports = router;
