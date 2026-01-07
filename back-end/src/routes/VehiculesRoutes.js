const express = require('express');
const router = express.Router();
const Vehicle = require('../models/VehicleModel');
const Task = require('../models/TaskModel');

// CRUD Véhicules
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération véhicules' });
  }
});

// Route pour récupérer les véhicules disponibles selon direction et dates
router.get('/available', async (req, res) => {
  try {
    const { direction, dateDebut, dateFin } = req.query;

    // Vérifier que tous les paramètres sont présents
    if (!direction || !dateDebut || !dateFin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Direction, dateDebut et dateFin sont requis' 
      });
    }

    // Convertir les dates en objets Date
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    // Récupérer tous les véhicules de la direction
    const vehiclesInDirection = await Vehicle.find({ direction });

    // Récupérer toutes les tâches qui ont un véhicule assigné et dont les dates chevauchent
    // Chevauchement : dateDebut de la tâche < dateFin recherchée ET dateFin de la tâche > dateDebut recherchée
    const overlappingTasks = await Task.find({
      vehicule: { $exists: true, $ne: null },
      necessiteVehicule: true,
      dateDebut: { $lt: endDate },
      dateFin: { $gt: startDate }
    }).populate('vehicule');

    // Créer un ensemble des IDs de véhicules occupés
    const occupiedVehicleIds = new Set();
    overlappingTasks.forEach(task => {
      if (task.vehicule && task.vehicule._id) {
        occupiedVehicleIds.add(task.vehicule._id.toString());
      }
    });

    // Marquer chaque véhicule comme disponible ou occupé
    const vehiclesWithAvailability = vehiclesInDirection.map(vehicle => {
      const isAvailable = !occupiedVehicleIds.has(vehicle._id.toString());
      
      // Trouver les tâches qui occupent ce véhicule
      const conflictingTasks = overlappingTasks
        .filter(task => task.vehicule && task.vehicule._id.toString() === vehicle._id.toString())
        .map(task => ({
          taskId: task._id,
          taskName: task.nom,
          dateDebut: task.dateDebut,
          dateFin: task.dateFin
        }));

      return {
        ...vehicle.toObject(),
        isAvailable,
        conflictingTasks: isAvailable ? [] : conflictingTasks
      };
    });

    // Compter les véhicules disponibles
    const availableCount = vehiclesWithAvailability.filter(v => v.isAvailable).length;

    res.json({ 
      success: true, 
      data: vehiclesWithAvailability,
      availableCount: availableCount,
      totalCount: vehiclesWithAvailability.length
    });
  } catch (error) {
    console.error('Erreur vérification disponibilité véhicules:', error);
    res.status(500).json({ success: false, message: 'Erreur vérification disponibilité véhicules' });
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
