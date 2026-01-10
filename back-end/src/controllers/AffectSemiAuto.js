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
  const task = await Task.findById(taskId).populate("tasks");

  // Étape 1 : filtrer les auditeurs par spécialité
  let auditors = await User.find({ role: "auditeur", specialite: task.specialite }).populate("tasks");

  // Étape 2 : éliminer les conflits temporels
  auditors = auditors.filter(a => !hasTimeConflict(a, task));

  // Étape 3 : trier par ancienneté et rémunération équitable
  auditors.sort((a, b) => {
    if (a.dateDebut.getTime() !== b.dateDebut.getTime()) {
      return a.dateDebut.getTime() - b.dateDebut.getTime(); // plus ancien d’abord
    }
    return a.paidTasksCount - b.paidTasksCount; // moins de tâches rémunérées d’abord
  });

  // Étape 4 : choisir l’auditeur
  const chosen = auditors[0];

  // Étape 5 : créer une affectation
  const affectation = new Affectation({
    modeAffectation: "SEMI_AUTOMATISE",
    statutAffectation: "PROPOSEE",
    tache: task._id,
    auditeur: chosen._id,
    auditeurPropose: chosen._id,
    rapportAlgorithmique: `Choisi selon spécialité=${task.specialite}, ancienneté=${chosen.dateDebut.toDateString()}, rémunération=${chosen.paidTasksCount}, pas de conflit temporel`
  });

  await affectation.save();

  // Étape 6 : générer le rapport JSON
  return {
    affectationId: affectation._id,
    task: {
      id: task._id,
      title: task.title,
      specialite: task.specialite,
      dateDebut: task.dateDebut,
      dateFin: task.dateFin,
      paid: task.renummeree
    },
    auditor: {
      id: chosen._id,
      name: chosen.name,
      specialite: chosen.specialite,
      dateDebut: chosen.dateDebut,
      paidTasksCount: chosen.paidTasksCount
    },
    method: "semi-automatisé",
    critere: {
      tourDeRole: "Ancienneté respectée (date d’embauche)",
      specialiteMatch: true,
      equitablePay: "Auditeur avec moins de tâches rémunérées",
      timeConflict: false
    },
    justification: `Auditeur ${chosen.name} choisi selon spécialité et équité.`,
    validation: {
      statutAffectation: affectation.statutAffectation,
      justificatif: affectation.justificatif || null
    }
  };
}

module.exports = { assignTaskSemiAuto };
