const mongoose  = require("mongoose");
const { Schema } = mongoose;

const affectationSchema = new Schema({
    modeAffectation: { type: String, enum: ['MANUEL', 'SEMI_AUTOMATISE', 'AUTOMATISE_IA'], required: true }, 
    statutAffectation: { type: String, enum: ['PROPOSEE', 'ACCEPTEE', 'REFUSEE', 'DELEGUEE', 'ANNULEE'], default: 'PROPOSEE' }, 
    justificatif: { type: String }, // obligatoire si refus ou annulation 
    tache: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }, 
    auditeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    heuresEffectuees: { type: Number, default: 0 }, 
    rapportAlgorithmique: { type: String }, // trace du choix IA ou semi-auto
    affectationOrigine: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }, 
    auditeurPropose: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    dateAffectation: { type: Date, default: Date.now } },);                         

module.exports = mongoose.model("Affectation", affectationSchema);