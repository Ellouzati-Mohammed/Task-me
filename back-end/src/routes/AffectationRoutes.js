const express = require('express');
const router = express.Router();
const Affectation = require('../models/AffectationModel');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { assignTaskAuto } = require('../controllers/AffecAuto');
const { assignTaskSemiAuto } = require('../controllers/AffectSemiAuto');

// Endpoint pour générer une affectation semi-automatisée
router.post('/assign/semi/:taskId', async (req, res) => {
  try {
    const report = await assignTaskSemiAuto(req.params.taskId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


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

// Récupérer les statistiques de l'auditeur connecté
router.get('/my-stats', authMiddleware, async (req, res) => {
  try {
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
    
    res.json({ 
      success: true, 
      data: {
        totalAffectations,
        acceptedTasks,
        refusedTasks,
        delegatedTasks,
        pendingTasks,
        completedTasks: 0 // Peut être ajouté plus tard
      }
    });
  } catch (error) {
    console.error('Erreur récupération statistiques auditeur:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération de vos statistiques' });
  }
});

// Récupérer les 5 dernières affectations pour l'activité récente
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const affectations = await Affectation.find()
      .populate('auditeur', 'prenom nom')
      .populate('tache', 'nom')
      .sort({ updatedAt: -1, createdAt: -1, dateAffectation: -1 })
      .limit(limit);
    
    res.json({ success: true, data: affectations });
  } catch (error) {
    console.error('Erreur récupération affectations récentes:', error);
    res.status(500).json({ success: false, message: 'Erreur récupération des affectations récentes' });
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
      newAffectationData.canDelegate = false; // Ne peut pas déléguer une tâche déjà déléguée
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
      
      // Si cette affectation a une affectation d'origine (cas de délégation acceptée), supprimer l'affectation d'origine
      if (updatedAffectation.affectationOrigine) {
        await Affectation.findByIdAndDelete(updatedAffectation.affectationOrigine);
      }
      
      // Récupérer la tâche associée
      const task = await Task.findById(updatedAffectation.tache._id || updatedAffectation.tache);
      
      if (task) {
        // Récupérer toutes les affectations de cette tâche
        const allAffectations = await Affectation.find({ tache: task._id });
        
        // Compter uniquement les affectations acceptées
        const acceptedCount = allAffectations.filter(
          affectation => affectation.statutAffectation === 'ACCEPTEE'
        ).length;
        
        // Si le nombre d'affectations acceptées correspond au nombre de places, changer le statut
        if (acceptedCount === task.nombrePlaces) {
          task.statutTache = 'COMPLETEE_AFFECTEE';
          await task.save();
        }
      }
    }

    // Vérifier si l'utilisateur vient de refuser la tâche
    if (req.body.statutAffectation === 'REFUSEE') {
      // Si cette affectation a une affectation d'origine (cas de délégation), refuser aussi l'affectation d'origine
      if (updatedAffectation.affectationOrigine) {
        await Affectation.findByIdAndUpdate(
          updatedAffectation.affectationOrigine,
          { 
            statutAffectation: 'REFUSEE',
            justificatif: `Refus suite à délégation: ${req.body.justificatif || 'Non spécifié'}`
          }
        );
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

// Endpoint pour générer une affectation semi-automatisée 
router.post('/assign/semi/:taskId', async (req, res) => { 
  try { 
    const report = await assignTaskSemiAuto(req.params.taskId); 
    res.json(report); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
});





// Endpoint pour affectation automatisée (IA) 
router.post('/assign/auto', async (req, res) => { 
  try { 
    const { taskId } = req.body; // le coordinateur envoie l'ID de la tâche 
    const report = await assignTaskAuto(taskId); 
    res.json(report); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
});

// Endpoint pour affectation automatisée (IA) - création de tâche 
router.post('/assign/auto/create', async (req, res) => { 
  try { const { title, specialty, startDate, endDate, paid } = req.body; 
  // Créer la tâche 
  const task = new Task({ title, specialty, startDate, endDate, paid }); 
  await task.save(); 
  // Lancer l’IA 
  const report = await assignTaskAuto(task._id); 
  res.json({ success: true, data: report }); 
} catch (err) { 
  res.status(500).json({ success: false, message: err.message }); 
} 
});

module.exports = router;
