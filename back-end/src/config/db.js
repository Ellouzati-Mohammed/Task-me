const mongoose = require("mongoose");

const MONGO_URI= "lien dial mongodb"


const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connecté");
  } catch (error) {
    console.error("Erreur connexion MongoDB :", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
