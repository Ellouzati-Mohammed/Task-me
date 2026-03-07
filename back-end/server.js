// importer les packages
require('./src/jobs/affectationExpiration.job');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

// initialisation de l'application express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const cors = require("cors");
app.use(cors({
  origin: "http://localhost:5173", // autorise le frontend
  credentials: true
}));


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

// Configuration Socket.IO
const userSockets = new Map(); // Map userId -> socketId

io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  // Enregistrer l'utilisateur
  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`Utilisateur ${userId} enregistré avec socket ${socket.id}`);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    // Retirer l'utilisateur de la map
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`Utilisateur ${userId} déconnecté`);
        break;
      }
    }
  });
});

// Rendre io accessible globalement
app.set('io', io);
app.set('userSockets', userSockets);

// connexion à la base de données et démarrage serveur
connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
    console.log(`Socket.IO activé`);
  });
});

module.exports = app;


