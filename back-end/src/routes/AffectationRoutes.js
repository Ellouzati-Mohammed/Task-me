const express = require('express');
const router = express.Router();
const Affectation = require('../models/AffectationModel');
const Task = require('../models/TaskModel');
const User = require('../models/UsersModel');
const { authMiddleware } = require('../middlewares/auth.middleware');
const axios = require('axios');
const { sendEmail } = require('../services/emailService');
const { emitNotification } = require('../services/notificationSocketService');
const Notification = require('../models/NotificationModel');

/**
 * Vérifie si un utilisateur a un conflit de dates avec une tâche
 * @param {string} userId - L'ID de l'utilisateur
 * @param {Object} task - La tâche à vérifier
 * @returns {Promise<Object|false>} - Retourne un objet avec les détails du conflit ou false s'il n'y a pas de conflit
 */
const hasTimeConflict = async (userId, task) => {
  try {
    // Récupérer les affectations acceptées de l'utilisateur
    const acceptedAffectations = await Affectation.find({
      auditeur: userId,
      statutAffectation: 'ACCEPTEE'
    }).populate('tache');

    const currentStart = new Date(task.dateDebut);
    const currentEnd = new Date(task.dateFin);
    
    // Vérifier chaque affectation acceptée
    for (const affectation of acceptedAffectations) {
      if (affectation.tache) {
        const existingTask = affectation.tache;
        const existingStart = new Date(existingTask.dateDebut);
        const existingEnd = new Date(existingTask.dateFin);

        // Vérifier le chevauchement
        if (currentStart < existingEnd && currentEnd > existingStart) {
          return {
            hasConflict: true,
            conflictingTask: existingTask,
            message: `Conflit de dates : L'utilisateur a déjà accepté la tâche "${existingTask.nom}" du ${existingStart.toLocaleDateString('fr-FR')} au ${existingEnd.toLocaleDateString('fr-FR')}`
          };
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erreur vérification conflit de dates:', error);
    throw error;
  }
};

/**
 * Affectation semi-automatisée d'une tâche à un auditeur
 * @param {string} taskId - L'ID de la tâche à affecter
 * @returns {Promise<Object>} - Rapport détaillé de l'affectation
 */
async function assignTaskSemiAuto(taskId) {
  const task = await Task.findById(taskId);
  
  if (!task) {
    throw new Error('Tâche introuvable');
  }

  // Étape 1 : filtrer les auditeurs par spécialité + grade
  const specialiteFilter ={
  role: "auditeur",
  actif: true,
  specialite: { $in: task.specialites },
  grade: { $in: task.grades }
 };
  

  let auditors = await User.find(specialiteFilter);

  if (auditors.length === 0) {
    throw new Error('Aucun auditeur disponible pour cette spécialité');
  }

  // Étape 2 : éliminer les conflits temporels
  const auditorsWithoutConflict = [];
  for (const auditor of auditors) {
    const conflict = await hasTimeConflict(auditor._id, task);
    if (!conflict) {
      auditorsWithoutConflict.push(auditor);
    }
  }

  if (auditorsWithoutConflict.length === 0) {
    throw new Error('Aucun auditeur disponible sans conflit de dates');
  }

  // Étape 3 : trier par ancienneté et rémunération équitable
  auditorsWithoutConflict.sort((a, b) => {
    const dateA = a.dateembauche ? new Date(a.dateembauche).getTime() : Date.now();
    const dateB = b.dateembauche ? new Date(b.dateembauche).getTime() : Date.now();
    
    if (dateA !== dateB) {
      return dateA - dateB; // plus ancien d'abord
    }
    return (a.paidTasksCount || 0) - (b.paidTasksCount || 0); // moins de tâches rémunérées d'abord
  });

  // Étape 4 : choisir l'auditeur
  const nbrplace=task.nombrePlaces;
  const chosen = auditorsWithoutConflict.slice(0, nbrplace);

 
  // Étape 6 : générer le rapport JSON
  return chosen;
}

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
    const { taskId, userId, modeAffectation = 'MANUEL', affectationOrigine, rapportIA } = req.body;

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
    const conflict = await hasTimeConflict(userId, currentTask);
    
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: conflict.message
      });
    }

    // Créer la nouvelle affectation
    const newAffectationData = {
      tache: taskId,
      auditeur: userId,
      modeAffectation: modeAffectation,
      statutAffectation: 'PROPOSEE'
    };
    // Ajouter rapportIA si fourni
    if (typeof rapportIA !== 'undefined') {
      newAffectationData.rapportIA = rapportIA;
    }
    console.log('Création affectation:', newAffectationData);
    
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

    // Envoi d'email à l'auditeur
    try {
      if (populatedAffectation?.auditeur?.email) {
        await sendEmail(
          populatedAffectation.auditeur.email,
          `Nouvelle affectation de tâche : ${populatedAffectation.tache.nom}`,
          `Bonjour ${populatedAffectation.auditeur.prenom},\n\nVous avez été affecté(e) à la tâche : ${populatedAffectation.tache.nom}.\nDescription : ${populatedAffectation.tache.description}\nDu ${new Date(populatedAffectation.tache.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(populatedAffectation.tache.dateFin).toLocaleDateString('fr-FR')}.\n\nMerci de consulter votre espace pour plus de détails.`
        );
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email:', err);
    }

    // Créer et envoyer une notification en temps réel
    try {
      console.log('📬 Création notification pour userId:', userId);
      const notification = await Notification.create({
        utilisateur: userId,
        typeNotification: 'AFFECTATION',
        message: `Nouvelle affectation : ${populatedAffectation.tache.nom}`,
        lue: false
      });
      console.log('✅ Notification créée:', notification);

      // Émettre la notification via Socket.IO
      emitNotification(req.app, userId, {
        _id: notification._id,
        type: notification.typeNotification,
        message: notification.message,
        createdAt: notification.date,
        lu: notification.lue
      });
      console.log('✅ Notification émise via Socket.IO');
    } catch (err) {
      console.error('❌ Erreur création notification:', err);
    }

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

// Affectation semi-automatisée d'une tâche
/**
 * Affectation automatique d'une tâche à des auditeurs via Ollama
 * @route POST /assign-auto
 * @body { taskId: string }
 * @returns {Object[]} Utilisateurs sélectionnés
 */
router.post('/assign-auto', async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'taskId est requis' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }


    // Récupérer tous les auditeurs actifs
    const allAuditors = await User.find({ role: 'auditeur', actif: true });

    // Filtrer les auditeurs sans conflit de dates
    const auditors = [];
    for (const auditor of allAuditors) {
      const conflict = await hasTimeConflict(auditor._id, task);
      if (!conflict) {
        auditors.push(auditor);
      }
    }

    // Préparer le prompt pour Groq
    const prompt = `Voici la liste des auditeurs (format JSON): ${JSON.stringify(auditors)}. Voici la tâche (format JSON): ${JSON.stringify(task)}. Sélectionne les meilleurs auditeurs pour cette tâche en tenant compte de la spécialité, du grade et de l'ancienneté. Retourne uniquement un tableau JSON d'objets, chaque objet doit contenir l'_id de l'auditeur sélectionné et un champ 'rapportIA' qui explique pourquoi il a été choisi. Exemple de format attendu : [{ "_id": "id1", "rapportIA": "justification pour id1" }, ...]`;

    // Appel à l'API Groq (OpenAI compatible)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'GROQ_API_KEY non défini dans les variables d\'environnement' });
    }

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'Tu es un assistant pour l\'affectation intelligente des tâches.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // On suppose que la réponse contient un tableau d'objets {_id, rapportIA}
    let selectedWithReports = [];
    try {
      const content = groqResponse.data.choices[0].message.content;
      selectedWithReports = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ success: false, message: "Aucun utilisateur n'est le bon pour cette tâche", raw: groqResponse.data });
    }

    // Renvoyer les utilisateurs sélectionnés avec leur justification
    const selectedUsers = auditors
      .filter(u => selectedWithReports.some(sel => sel._id === u._id.toString()))
      .map(u => {
        const rapportIA = selectedWithReports.find(sel => sel._id === u._id.toString())?.rapportIA || '';
        return { ...u.toObject(), rapportIA };
      });
    res.json({ success: true, data: selectedUsers });
  } catch (error) {
    console.error('Erreur affectation auto via Ollama:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur lors de l\'affectation auto' });
  }
});
router.post('/assign-semi-auto', async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'taskId est requis'
      });
    }

    const report = await assignTaskSemiAuto(taskId);

    res.status(201).json({
      success: true,
      message: 'Tâche affectée avec succès en mode semi-automatisé',
      data: report
    });
  } catch (error) {
    console.error('Erreur affectation semi-automatisée:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'affectation semi-automatisée'
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
        // Si la tâche est rémunérée, incrémenter le compteur de l'auditeur
        if (task.remuneree) {
          await User.findByIdAndUpdate(
            updatedAffectation.auditeur._id || updatedAffectation.auditeur,
            { $inc: { paidTasksCount: 1 } }
          );
        }
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

module.exports = router;
