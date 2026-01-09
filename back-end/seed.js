const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

// Importer le modèle User
const User = require('./src/models/UsersModel');

// Générer les mots de passe hashés
const adminPassword = bcrypt.hashSync('123', 10);
const coordinateurPassword = bcrypt.hashSync('123', 10);
const auditeur1Password = bcrypt.hashSync('123', 10);
const auditeur2Password = bcrypt.hashSync('123', 10);

// Données de test
const usersData = [
  {
    nom: 'Admin',
    prenom: 'Système',
    email: 'admin@taskme.ma',
    motdePasse: adminPassword,
    actif: true,
    role: 'admin',
    dateembauche: new Date('2024-01-01')
  },
  {
    nom: 'Imane',
    prenom: 'El Fadili',
    email: 'imane.el@taskme.ma',
    motdePasse: coordinateurPassword,
    actif: true,
    role: 'coordinateur',
    dateembauche: new Date('2024-06-01')
  },
  {
    nom: 'Benali',
    prenom: 'Ahmed',
    email: 'ahmed.benali@taskme.ma',
    motdePasse: auditeur1Password,
    grade: 'A',
    specialite: 'pedagogique',
    formation: 'Formation Pédagogie Avancée',
    diplomes: 'Master en Sciences de l\'Éducation',
    actif: true,
    role: 'auditeur',
    dateembauche: new Date('2024-09-01')
  },
  {
    nom: 'Zahra',
    prenom: 'Fatima',
    email: 'fatima.zahra@taskme.ma',
    motdePasse: auditeur2Password,
    grade: 'B',
    specialite: 'orientation',
    formation: 'Formation Orientation Professionnelle',
    diplomes: 'Licence en Psychologie',
    actif: true,
    role: 'auditeur',
    dateembauche: new Date('2025-03-15')
  }
];

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connexion à MongoDB établie.');
    console.log('Nettoyage de la collection users...');
    return User.deleteMany({});
  })
  .then(() => {
    console.log('Insertion des utilisateurs...');
    return User.insertMany(usersData);
  })
  .then((users) => {
    console.log(`${users.length} utilisateurs créés avec succès !`);
    console.log('- Admin: admin@taskme.ma (mot de passe: 123)');
    console.log('- Coordinateur: imane.el@taskme.ma (mot de passe: 123)');
    console.log('- Auditeur 1: ahmed.benali@taskme.ma (mot de passe: 123)');
    console.log('- Auditeur 2: fatima.zahra@taskme.ma (mot de passe: 123)');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  });


