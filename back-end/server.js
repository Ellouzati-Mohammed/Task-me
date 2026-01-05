// importer les packages
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// initialisation de l'application express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// importation des routes
const authRoutes = require('./src/routes/AuthRoutes'); 
const userRoutes = require('./src/routes/UsersRoutes'); 
const taskRoutes = require('./src/routes/TasksRoutes'); 
const affectationRoutes = require('./src/routes/AffectationRoutes'); 
const vehicleRoutes = require('./src/routes/VehiculesRoutes'); 
const chatRoutes = require('./src/routes/ChatRoutes'); 
const historyRoutes = require('./src/routes/HistoRoutes');
const notificationRoutes = require('./src/routes/NotifRoutes'); 
const messageRoutes = require('./src/routes/MessageRoutes');


// utilisation des routes 
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/tasks', taskRoutes); 
app.use('/api/affectations', affectationRoutes); 
app.use('/api/vehicles', vehicleRoutes); 
app.use('/api/chats', chatRoutes); 
app.use('/api/history', historyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// route de test
app.get('/', (req, res) => {
  res.send('API TaskMe fonctionne correctement');
});

// connexion à la base de données et démarrage serveur
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connexion à MongoDB établie.');
    app.listen(port, () => {
      console.log(`Serveur démarré sur le port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Connexion à MongoDB échouée.', error);
  });

module.exports = app;


