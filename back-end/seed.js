const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

// Importer les modèles
const User = require('./src/models/UsersModel');
const Task = require('./src/models/TaskModel');
const Vehicle = require('./src/models/VehicleModel');
const Affectation = require('./src/models/AffectationModel');
const Chat = require('./src/models/ChatModel');
const Message = require('./src/models/MessageModel');
const Notification = require('./src/models/NotificationModel');

// Générer les mots de passe hashés
const password1 = bcrypt.hashSync('password123', 10);
const password2 = bcrypt.hashSync('password456', 10);

// Données de test
const usersData = [
  {
    nom: 'Imane',
    prenom: 'El',
    email: 'imane.el@test.com',
    motdePasse: password1,
    grade: 'A',
    specialite: 'pédagogique',
    formation: 'Formation Node.js',
    diplomes: 'Master Informatique',
    actif: true,
    role: 'coordinateur',
    dateembauche: new Date('2022-09-01')
  },
  {
    nom: 'Youssef',
    prenom: 'Benali',
    email: 'youssef.benali@test.com',
    motdePasse: password2,
    grade: 'B',
    specialite: 'orientation',
    formation: 'Formation Agile',
    diplomes: 'Licence Management',
    actif: true,
    role: 'user',
    dateembauche: new Date('2023-01-15')
  }
];

const tasksData = [
  {
    nom: 'Audit pédagogique',
    description: 'Audit des cours dispensés au centre de formation',
    typeTache: 'Observateur',
    dateDebut: new Date('2026-01-10T09:00:00Z'),
    dateFin: new Date('2026-01-10T17:00:00Z'),
    remuneree: true,
    specialites: ['pédagogique'],
    grades: ['A', 'B'],
    necessiteVehicule: true,
    directionAssociee: 'Rabat-Casa',
    fichierJoint: 'audit.pdf',
    nombrePlaces: 2,
    Vehicle:Vehicles[0]?._id,
    statutTache: 'Ouverte'
  },
  {
    nom: 'Formation Agile',
    description: 'Session de formation sur les méthodes agiles',
    typeTache: 'Formateur',
    dateDebut: new Date('2026-01-12T09:00:00Z'),
    dateFin: new Date('2026-01-12T17:00:00Z'),
    remuneree: true,
    specialites: ['orientation'],
    grades: ['B'],
    necessiteVehicule: false,
    directionAssociee: 'Meknès-Errachidia',
    fichierJoint: 'agile.pdf',
    nombrePlaces: 3,
    statutTache: 'Ouverte',
    urgent: true
  }
];

// Connexion MongoDB avec promesse

mongoose.connect('mongodb+srv://ifdili_db_user:imanefd@cluster0.uugwydp.mongodb.net/TaskMe?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connexion à MongoDB établie.');
    console.log('Nettoyage des collections...');

    return User.deleteMany({})
      .then(() => Task.deleteMany({}))
      .then(() => Vehicle.deleteMany({}))
      .then(() => Affectation.deleteMany({}))
      .then(() => Chat.deleteMany({}))
      .then(() => Message.deleteMany({}))
      .then(() => Notification.deleteMany({}));
  })
  .then(() => {
    console.log('Insertion des utilisateurs...');
    return User.insertMany(usersData);
  })
  .then(users => {
    console.log('Insertion des tâches...');
    return Task.insertMany(tasksData).then(tasks => ({ users, tasks }));
  })
  .then(({ users, tasks }) => {
    console.log('Insertion des véhicules...');
    return Vehicle.insertMany([
      { immatriculation: '123-ABC', marque: 'Toyota', modele: 'Corolla', direction: 'Rabat-Casa' },
      { immatriculation: '456-XYZ', marque: 'Renault', modele: 'Clio', direction: 'Meknès-Errachidia' }
    ]).then(() => ({ users, tasks }));
  })
  
  .then(({ users, tasks }) => {
    console.log('Insertion des affectations...');
    return Affectation.insertMany([
      {
        modeAffectation: 'SEMI_AUTOMATISE',
        statutAffectation: 'PROPOSEE',
        tache: tasks[0]._id,
        auditeur: users[1]._id,
        rapportAlgorithmique: 'Affectation basée sur spécialité et disponibilité',
        dateAffectation: new Date('2026-01-05T10:00:00Z')
      }
    ]).then(() => ({ users }));
  })
  .then(({ users }) => {
    console.log('Insertion du chat et message...');
    return Chat.create({
      participants: [users[0]._id, users[1]._id],
      titre: 'Discussion sur l’audit',
      conversation: 'GoupeTACHE'
    }).then(chat => {
      return Message.create({
        contenu: "Bonjour, peux-tu préparer le rapport d’audit ?",
        conversation: chat._id,
        expediteur: users[0]._id
      }).then(() => ({ users }));
    });
  })
  .then(({ users }) => {
    console.log('Insertion des notifications...');
    return Notification.create({
      typeNotification: 'AFFECTATION',
      message: 'Nouvelle tâche affectée : Audit pédagogique',
      utilisateur: users[1]._id
    });
  })
  .then(() => {
    console.log('Données de test insérées avec succès !');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  });


