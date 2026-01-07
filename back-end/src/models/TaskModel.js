const mongoose = require( 'mongoose'); 
const { Schema } = mongoose;


const taskSchema = new Schema({ 
    nom: { type: String, required: true },
    description:{type:String, required:true},
    typeTache: { type: String, enum: ["Formateur", "Membre de Jury", "Bénéficiaire de formation", "Observateur", "Concepteur"] },
    dateDebut:{type : Date, required:true},
    dateFin:{type : Date, required:true},
    remuneree: { type: Boolean, default: false },
    specialites: [String],
    grades: [String],
    commune: { type: Boolean, default: false },
    necessiteVehicule: { type: Boolean, default: false },
    vehicule: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    directionAssociee: { type: String, enum: ["Rabat-Casa", "Meknès-Errachidia", "Marrakech-Agadir"] },
    fichierJoint: {type:String},
    nombrePlaces: {type:Number, default:1},
    statutTache: { 
      type: String, 
      enum: [
        "CREEE",
        "EN_AFFECTATION",
        "COMPLETEE_AFFECTEE",
        "EN_COURS",
        "TERMINEE",
        "ANNULEE"
      ], 
      default: "CREEE" 
    },
    dateCreation: { type: Date, default: Date.now },
    urgent: { type: Boolean, default: false },
    coordinateur: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }
  }); 
   
  const Task = mongoose.model('Task', taskSchema); 
  module.exports = Task;    



