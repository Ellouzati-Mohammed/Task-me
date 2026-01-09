const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const { Schema } = mongoose; 

const userSchema = new Schema({ 

    nom: { type: String, required: true }, 
    prenom: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    motdePasse: { type: String, required: true },   
    grade: { type: String, enum: ['',"A", "B", "C"] }, 
    specialite: { type: String, enum:['','pedagogique', 'orientation', 'planification', 'services_financiers'] }, 
    formation: { type: String }, 
    diplomes: { type: String }, 
    actif: { type: Boolean, default: true }, 
    role: { type: String, enum: ["admin", "coordinateur", "auditeur"], default: "auditeur" } , 
    dateembauche:{ type: Date }
});

// Hachage du mot de passe avant la sauvegarde
userSchema.pre('save', async function() {
  // Ne hacher que si le mot de passe a été modifié ou est nouveau
  if (!this.isModified('motdePasse')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.motdePasse = await bcrypt.hash(this.motdePasse, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.motdePasse);
};

module.exports = mongoose.model("User", userSchema);

