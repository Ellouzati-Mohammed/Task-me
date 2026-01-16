const User = require('../models/UsersModel');
const Task = require('../models/TaskModel');
const Affectation = require('../models/AffectationModel');

// Vérifier chevauchement des dates
function hasTimeConflict(user, task) {
  return user.tasks.some(t => {
    const start1 = new Date(t.dateDebut);
    const end1 = new Date(t.dateFin);
    const start2 = new Date(task.dateDebut);
    const end2 = new Date(task.dateFin);

    return (start1 <= end2 && start2 <= end1); // chevauchement
  });
}

async function assignTaskSemiAuto(taskId) {
  const task = await Task.findById(taskId).populate("auditeur");

  if (!task) {
    throw new Error("Tâche introuvable");
  }

  // Étape 1 : filtrer les auditeurs par spécialité (insensible à la casse/accents si besoin)
  let auditors = await User.find({ 
    role: "auditeur", 
    specialite: { $in: task.specialites } 
  }).populate("tasks");

  console.log("Tâche spécialités:", task.specialites);
  console.log("Auditeurs trouvés:", auditors.map(a => ({ nom: a.nom, prenom: a.prenom, specialite: a.specialite })));

  // Étape 2 : éliminer les conflits temporels
  auditors = auditors.filter(a => !hasTimeConflict(a, task));

  // Étape 3 : trier par ancienneté et rémunération équitable
  auditors.sort((a, b) => {
    if (a.dateembauche.getTime() !== b.dateembauche.getTime()) {
      return a.dateembauche.getTime() - b.dateembauche.getTime(); // plus ancien d’abord
    }
    return a.paidTasksCount - b.paidTasksCount; // moins de tâches rémunérées d’abord
  });

  // Étape 4 : choisir l’auditeur
  const chosen = auditors[0];
  if (!chosen) {
    return {
      error: "Aucun auditeur disponible pour cette tâche",
      taskId: task._id
    };
  }

  // Étape 5 : créer une affectation
  const affectation = new Affectation({
    modeAffectation: "SEMI_AUTOMATISE",
    statutAffectation: "PROPOSEE",
    tache: task._id,
    auditeur: chosen._id,
    auditeurPropose: chosen._id,
    rapportAlgorithmique: `Choisi selon spécialité=${task.specialites.join(", ")}, ancienneté=${chosen.dateembauche.toDateString()}, rémunération=${chosen.paidTasksCount}, pas de conflit temporel`
  });

  await affectation.save();

  // Étape 6 : générer le rapport JSON
  return {
    affectationId: affectation._id,
    task: {
      id: task._id,
      title: task.nom, // ton schéma utilise "nom"
      specialites: task.specialites,
      dateDebut: task.dateDebut,
      dateFin: task.dateFin,
      paid: task.remuneree
    },
    auditor: {
      id: chosen._id,
      name: `${chosen.nom} ${chosen.prenom}`,
      specialite: chosen.specialite,
      dateEmbauche: chosen.dateembauche,
      paidTasksCount: chosen.paidTasksCount
    },
    method: "semi-automatisé",
    critere: {
      tourDeRole: "Ancienneté respectée (date d’embauche)",
      specialiteMatch: true,
      equitablePay: "Auditeur avec moins de tâches rémunérées",
      timeConflict: false
    },
    justification: `Auditeur ${chosen.nom} ${chosen.prenom} choisi selon spécialité et équité.`,
    validation: {
      statutAffectation: affectation.statutAffectation,
      justificatif: affectation.justificatif || null
    }
  };
}

module.exports = { assignTaskSemiAuto };
