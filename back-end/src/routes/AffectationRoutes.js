const express = require('express');
const router = express.Router();
const Affectation = require('../models/AffectationModel');
const { authMiddleware } = require('../middlewares/auth.middleware');

// CRUD Affectations
router.get('/', async (req, res) => {
  try {
    // Filtrer par tâche si le paramètre est fourni
    const filter = {};
    if (req.query.tache) {
      filter.tache = req.query.tache;
    }
    
    const Affectations = await Affectation.find(filter).populate('tache auditeur');
    res.json({ success: true, data: Affectations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération affectations' });
  }
});

// Récupérer les affectations d'une tâche spécifique
router.get('/task/:taskId', async (req, res) => {
  try {
    const affectations = await Affectation.find({ tache: req.params.taskId }).populate('auditeur');
    res.json({ success: true, data: affectations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération affectations de la tâche' });
  }
});

// Récupérer les tâches affectées à l'utilisateur connecté
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    const affectations = await Affectation.find({ 
      auditeur: req.user._id 
    }).populate('tache');
    
    res.json({ success: true, data: affectations });
  } catch (error) {
    console.error('Erreur récupération mes tâches:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération de vos tâches' });
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

// Affecter un utilisateur à une tâche
router.post('/assign', authMiddleware, async (req, res) => {
  try {
    const { taskId, userId, modeAffectation = 'MANUEL', affectationOrigine } = req.body;

    // Vérifier que les paramètres requis sont fournis
    if (!taskId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'taskId et userId sont requis'
      });
    }

    // Récupérer la tâche pour obtenir les dates
    const Task = require('../models/TaskModel');
    const currentTask = await Task.findById(taskId);
    
    if (!currentTask) {
      return res.status(404).json({
        success: false,
        message: 'Tâche introuvable'
      });
    }

    // Vérifier si l'utilisateur n'est pas déjà affecté à cette tâche
    const existingAffectation = await Affectation.findOne({
      tache: taskId,
      auditeur: userId
    });

    if (existingAffectation) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur est déjà affecté à cette tâche'
      });
    }

    // Vérifier les chevauchements de dates avec les tâches acceptées par l'utilisateur
    const acceptedAffectations = await Affectation.find({
      auditeur: userId,
      statutAffectation: 'ACCEPTEE'
    }).populate('tache');

    // Vérifier si une tâche acceptée chevauche avec la tâche actuelle
    for (const affectation of acceptedAffectations) {
      if (affectation.tache) {
        const existingTask = affectation.tache;
        const currentStart = new Date(currentTask.dateDebut);
        const currentEnd = new Date(currentTask.dateFin);
        const existingStart = new Date(existingTask.dateDebut);
        const existingEnd = new Date(existingTask.dateFin);

        // Vérifier le chevauchement : la nouvelle tâche commence avant que l'ancienne se termine
        // ET la nouvelle tâche se termine après que l'ancienne commence
        if (currentStart < existingEnd && currentEnd > existingStart) {
          return res.status(400).json({
            success: false,
            message: `Conflit de dates : L'utilisateur a déjà accepté la tâche "${existingTask.nom}" du ${existingStart.toLocaleDateString('fr-FR')} au ${existingEnd.toLocaleDateString('fr-FR')}`
          });
        }
      }
    }

    // Créer la nouvelle affectation
    const newAffectationData = {
      tache: taskId,
      auditeur: userId,
      modeAffectation: modeAffectation,
      statutAffectation: 'PROPOSEE'
    };
    
    // Ajouter l'affectation d'origine si elle est fournie (cas de délégation)
    if (affectationOrigine) {
      newAffectationData.affectationOrigine = affectationOrigine;
    }
    
    const newAffectation = new Affectation(newAffectationData);

    await newAffectation.save();

    // Si la tâche est en statut CREEE, la passer en EN_AFFECTATION
    if (currentTask.statutTache === 'CREEE') {
      currentTask.statutTache = 'EN_AFFECTATION';
      await currentTask.save();
    }

    // Récupérer l'affectation avec les données populées
    const populatedAffectation = await Affectation.findById(newAffectation._id)
      .populate('tache')
      .populate('auditeur');

    res.status(201).json({
      success: true,
      message: 'Utilisateur affecté à la tâche avec succès',
      data: populatedAffectation
    });
  } catch (error) {
    console.error('Erreur affectation utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'affectation de l\'utilisateur'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedAffectation = await Affectation.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('tache auditeur');
    
    if (!updatedAffectation) {
      return res.status(404).json({ success: false, message: 'Affectation introuvable' });
    }

    // Vérifier si l'utilisateur vient d'accepter la tâche
    if (req.body.statutAffectation === 'ACCEPTEE') {
      const Task = require('../models/TaskModel');
      
      // Récupérer la tâche associée
      const task = await Task.findById(updatedAffectation.tache._id || updatedAffectation.tache);
      
      if (task) {
        // Récupérer toutes les affectations de cette tâche
        const allAffectations = await Affectation.find({ tache: task._id });
        
        // Vérifier si toutes les affectations sont acceptées
        const allAccepted = allAffectations.every(
          affectation => affectation.statutAffectation === 'ACCEPTEE'
        );
        
        // Vérifier aussi que le nombre d'affectations acceptées correspond au nombre de places
        const acceptedCount = allAffectations.filter(
          affectation => affectation.statutAffectation === 'ACCEPTEE'
        ).length;
        
        // Si toutes les places sont pourvues et toutes acceptées, changer le statut
        if (allAccepted && acceptedCount === task.nombrePlaces) {
          task.statutTache = 'COMPLETEE_AFFECTEE';
          await task.save();
        }
      }
    }
    
    res.json({ success: true, data: updatedAffectation });
  } catch (error) {
    console.error('Erreur mise à jour affectation:', error);
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
