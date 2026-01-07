const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/UsersModel');

//  Inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Ce nom d’utilisateur est déjà utilisé. Veuillez en choisir un autre.'
      });
    }

    // Créer et sauvegarder le nouvel utilisateur
    user = new User({ username, password });
    await user.save();

    // Générer un token JWT pour l’utilisateur
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      success: true,
      message: 'Bienvenue ! Ton compte a été créé avec succès ',
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l’inscription '
    });
  }
});

// Connexion d’un utilisateur existant
router.post('/login', async (req, res) => {
  const { email, motdePasse } = req.body;

  try {
    // Vérifier si l'utilisateur existe par email
    let user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'identification échouée. Vérifie tes informations '
      });
    }

    // Vérifier que le mot de passe est bien présent
    if (!motdePasse || !user.motdePasse) {
      return res.status(400).json({
        success: false,
        message: 'Données de connexion invalides'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(motdePasse);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe incorrect '
      });
    }

    // Générer un token JWT
    const payload = { 
      user: { 
        id: user.id,
        email: user.email,
        role: user.role
      } 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        grade: user.grade,
        specialite: user.specialite,
        formation: user.formation,
        diplomes: user.diplomes,
        actif: user.actif,
        dateembauche: user.dateembauche
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion '
    });
  }
});

// Récupérer les infos de l’utilisateur connecté
router.get('/me', async (req, res) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Pas de token fourni. Accès refusé '
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur complet depuis la base de données
    const user = await User.findById(decoded.user.id).select('-motdePasse');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voici tes informations',
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        grade: user.grade,
        specialite: user.specialite,
        formation: user.formation,
        diplomes: user.diplomes,
        actif: user.actif,
        dateembauche: user.dateembauche
      }
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré '
    });
  }
});

module.exports = router;

