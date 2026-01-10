// controllers/AffecAuto.js
const User = require('../models/UsersModel');
const Task = require('../models/TaskModel');
const Affectation = require('../models/AffectationModel');
const { spawn } = require('child_process'); // pour Ollama

// Fonction pour interroger Ollama
function askOllama(prompt) {
  return new Promise((resolve, reject) => {
    const ollama = spawn('ollama', ['run', 'llama2:latest']);
    let output = '';

    ollama.stdin.write(prompt);
    ollama.stdin.end();

    ollama.stdout.on('data', data => {
      output += data.toString();
    });

    ollama.stderr.on('data', err => {
      console.error('Ollama error:', err.toString());
    });

    ollama.on('close', () => {
      resolve(output.trim());
    });
  });
}

// Fonction d’affectation automatisée
async function assignTaskAuto(taskId) {
  const task = await Task.findById(taskId).populate("tasks");
  let auditors = await User.find({ role: "auditeur", specialite: task.specialite }).populate("tasks");

  const context = { task, auditors };
  const prompt = `
Tu es un système d'affectation intelligent.
Tâche: ${JSON.stringify(context.task)}
Auditeurs disponibles: ${JSON.stringify(context.auditors)}

Critères:
- Respecter spécialité
- Ancienneté
- Équité rémunération
- Pas de chevauchement temporel
- Compatibilité diplômes/formation
- Éviter surcharge ou répétition

Retourne en JSON: { "auditorId": "...", "justification": "..." }
`;

  const aiResponse = await askOllama(prompt);
  const choice = JSON.parse(aiResponse);

  const affectation = new Affectation({
    modeAffectation: "AUTOMATISE",
    statutAffectation: "PROPOSEE",
    tache: task._id,
    auditeur: choice.auditorId,
    auditeurPropose: choice.auditorId,
    rapportAlgorithmique: choice.justificatif
  });

  await affectation.save();
  return affectation;
}

module.exports = { assignTaskAuto };

