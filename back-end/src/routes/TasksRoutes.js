const express = require('express');
const router = express.Router();
const Task = require('../models/TaskModel');
const User = require('../models/UsersModel');
const Affectation = require('../models/AffectationModel');
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload de fichiers
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Récupérer les statistiques du dashboard
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Filtrer par coordinateur si l'utilisateur est un coordinateur
    const filter = req.user.role === 'coordinateur' ? { coordinateur: req.user._id } : {};
    
    // Compter les tâches par statut
    const totalTasks = await Task.countDocuments(filter);
    const pendingTasks = await Task.countDocuments({ 
      ...filter,
      statutTache: { $in: ['CREEE', 'EN_AFFECTATION'] } 
    });
    const completedTasks = await Task.countDocuments({ ...filter, statutTache: 'TERMINEE' });
    const inProgressTasks = await Task.countDocuments({ ...filter, statutTache: 'EN_COURS' });
    const assignedTasks = await Task.countDocuments({ ...filter, statutTache: 'COMPLETEE_AFFECTEE' });
    const cancelledTasks = await Task.countDocuments({ ...filter, statutTache: 'ANNULEE' });
    
    // Compter les auditeurs actifs
    const activeAuditors = await User.countDocuments({ role: 'auditeur', actif: true });
    
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
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Filtrer par coordinateur si l'utilisateur est un coordinateur
    const filter = req.user.role === 'coordinateur' ? { coordinateur: req.user._id } : {};
    const tasks = await Task.find(filter);
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
router.post('/', authMiddleware, upload.single('fichierJoint'), async (req, res) => {
  try {
    console.log('=== CRÉATION DE TÂCHE ===');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    
    // Parser les tableaux JSON s'ils sont en string
    const specialites = typeof req.body.specialites === 'string' 
      ? JSON.parse(req.body.specialites) 
      : req.body.specialites;
    
    const grades = typeof req.body.grades === 'string' 
      ? JSON.parse(req.body.grades) 
      : req.body.grades;
    
    // Ajouter automatiquement le coordinateur (l'utilisateur connecté)
    const taskData = {
      ...req.body,
      specialites,
      grades,
      coordinateur: req.user._id,
      fichierJoint: req.file ? req.file.filename : null,
      // Convertir les chaînes vides en null pour directionAssociee
      directionAssociee: req.body.directionAssociee && req.body.directionAssociee !== '' 
        ? req.body.directionAssociee 
        : undefined
    };
    
    console.log('taskData:', taskData);
    
    const newTask = new Task(taskData);
    await newTask.save();
    
    console.log('✓ Tâche créée avec succès:', newTask._id);
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.error('❌ ERREUR lors de la création de la tâche:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la tâche', error: error.message });
  }
});

// Mettre à jour une tâche
router.put('/:id', upload.single('fichierJoint'), async (req, res) => {
  try {
    console.log('=== MISE À JOUR DE TÂCHE ===');
    console.log('ID:', req.params.id);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    
    // Parser les tableaux JSON s'ils sont en string
    const specialites = typeof req.body.specialites === 'string' 
      ? JSON.parse(req.body.specialites) 
      : req.body.specialites;
    
    const grades = typeof req.body.grades === 'string' 
      ? JSON.parse(req.body.grades) 
      : req.body.grades;
    
    const updateData = {
      ...req.body,
      specialites,
      grades,
      ...(req.file && { fichierJoint: req.file.filename }),
      // Convertir les chaînes vides en null pour directionAssociee
      directionAssociee: req.body.directionAssociee && req.body.directionAssociee !== '' 
        ? req.body.directionAssociee 
        : undefined
    };
    
    console.log('updateData:', updateData);
    
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedTask) return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    
    console.log('✓ Tâche mise à jour avec succès');
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('❌ ERREUR lors de la mise à jour de la tâche:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la tâche', error: error.message });
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

// Télécharger un fichier joint
router.get('/download/:filename', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, '../../uploads', req.params.filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'Fichier introuvable' });
    }
  });
});

module.exports = router;
