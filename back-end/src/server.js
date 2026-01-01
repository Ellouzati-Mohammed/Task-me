require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");


const PORT =  5000;

// Connexion DB
connectDB();

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
