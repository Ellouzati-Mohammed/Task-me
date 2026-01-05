const mongoose = require('mongoose');

// Charger .env sans afficher les messages d'un package (ex: dotenvx)
function loadDotenvQuiet() {
  const _out = process.stdout.write;
  const _err = process.stderr.write;
  try {
    process.stdout.write = () => {};
    process.stderr.write = () => {};
    require('dotenv').config();
  } finally {
    process.stdout.write = _out;
    process.stderr.write = _err;
  }
}

async function connectDB(uri = process.env.MONGO_URI, options = {}) {
  if (!uri) {
    throw new Error('MONGO_URI non défini dans les variables d\'environnement');
  }
  const opts = Object.assign({}, DEFAULT_OPTIONS, options);
  let attempts = 0;
  const maxAttempts = 5;
  const baseDelay = 1000;

  while (attempts < maxAttempts) {
    try {
      await mongoose.connect(uri, opts);

      mongoose.connection.on('error', err => console.error('MongoDB connection error:', err));
      mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

      console.log('Connexion à MongoDB établie.');
      return mongoose;
    } catch (err) {
      attempts += 1;
      console.warn(`Échec connexion MongoDB (essai ${attempts}/${maxAttempts}): ${err.message}`);
      if (attempts >= maxAttempts) throw err;
      await new Promise(r => setTimeout(r, baseDelay * attempts));
    }
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  } catch (err) {
    console.error('Erreur lors de la déconnexion MongoDB', err);
  }
}

// Fermeture propre lors des signaux du processus
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB };