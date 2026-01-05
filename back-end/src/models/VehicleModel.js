const mongoose = require("mongoose");
const { Schema } = mongoose; 

const vehicleSchema = new Schema({
  immatriculation: { type: String, required: true, unique: true },
  marque: { type: String},
  modele:{type:String} ,
  direction: { type: String, enum: ["Rabat-Casa", "Meknès-Errachidia", "Marrakech-Agadir"] }
}); 

module.exports = mongoose.model("Vehicle", vehicleSchema);
