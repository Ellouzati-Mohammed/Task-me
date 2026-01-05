const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const { Schema } = mongoose; 

const userSchema = new Schema({ 

    nom: { type: String, required: true }, 
    prenom: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    motdePasse: { type: String, required: true },   
    grade: { type: String, enum: ["A", "B", "C"] }, 
    specialite: { type: String, enum:['pédagogique', 'orientation', 'planification', 'financier'] , required:true}, 
    formation: { type: String }, 
    diplomes: { type: String }, 
    actif: { type: Boolean, default: false }, 
    role: { type: String, enum: ["admin", "coordinateur", "auteur", "user"], default: "user" } , 
    dateembauche:{ type: Date }
});

/*
// 🔐 hash avant sauvegarde
userSchema.pre('save', passwordHash);

// 🔎 comparer mots de passe
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.motdePasse);
};
*/
module.exports = mongoose.model("User", userSchema);

