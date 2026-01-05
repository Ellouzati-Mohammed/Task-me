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
    vehicule: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicule" },
    directionAssociee: { type: String, enum: ["Rabat-Casa", "Meknès-Errachidia", "Marrakech-Agadir"] },
    fichierJoint: {type:String, required:true},
    nombrePlaces: {type:Number, default:1},
    statutTache: { 
      type: String, 
      enum: [
        "Ouverte",       // tâche créée, en attente de réponse.
        "Acceptée",      // auditeur accepte
        "Refusée",       // auditeur refuse avec justification
        "Déléguée",      // auditeur propose un autre
        "En cours",      // tâche en exécution
        "Terminée",      // tâche achevée
        "Annulée"        // annulée par coordinateur ou autre
      ], 
      default: "Ouverte" 
    },
    dateCreation: { type: Date, default: Date.now },
    urgent: { type: Boolean, default: false },
    coordinateur: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }
  }); 
   
  const Task = mongoose.model('Task', taskSchema); 
  module.exports = Task;    



