const mongoose  = require("mongoose");
const { Schema } = mongoose;

const affectationSchema = new Schema({
    modeAffectation: { type: String, enum: ['MANUEL', 'SEMI_AUTOMATISE', 'AUTOMATISE_IA'], required: true }, 
    statutAffectation: { type: String, enum: ['PROPOSEE', 'ACCEPTEE', 'REFUSEE', 'DELEGUEE', 'ANNULEE'], default: 'PROPOSEE' }, 
    justificatif: { type: String }, // obligatoire si refus ou annulation 
    tache: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }, 
    auditeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    //rapportAlgorithmique: { type: String }, // trace du choix IA ou semi-auto
    affectationOrigine: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }, 
    auditeurPropose: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    canDelegate: { type: Boolean, default: true }, // false si la tâche vient d'une délégation (ne peut pas déléguer 2 fois)
    dateAffectation: { type: Date, default: Date.now } },
 { timestamps: true }
 );                         

module.exports = mongoose.model("Affectation", affectationSchema);