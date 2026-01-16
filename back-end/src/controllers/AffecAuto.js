// controllers/AffecAuto.js
const User = require('../models/UsersModel');
const Task = require('../models/TaskModel');
const Affectation = require('../models/AffectationModel');
const { spawn } = require('child_process');

const USE_MOCK = false; // mets true pour tester sans Ollama

function askOllama(prompt) {
  if (USE_MOCK) {
    return Promise.resolve(JSON.stringify({
      auditorId: "696259ec4bc383790f95879e", // un ID valide existant en base
      justification: "Auditeur choisi car spécialité et disponibilité correspondent."
    }));
  }

  return new Promise((resolve, reject) => {
    const ollama = spawn('ollama', ['run', 'llama2']);
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

async function assignTaskAuto(taskId) {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Tâche introuvable");

  const auditors = await User.find({
    role: "auditeur",
    specialite: { $in: task.specialites }
  });

  const prompt = `
Tu es un système d'affectation intelligent.
Tâche: ${JSON.stringify(task)}
Auditeurs disponibles: ${JSON.stringify(auditors)}

Retourne UNIQUEMENT en JSON strict :
{ "auditorId": "<_id d'un auditeur de la liste>", "justification": "..." }
`;

  const aiResponse = await askOllama(prompt);

  let choice;
  try {
    const match = aiResponse.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Pas de JSON trouvé dans la réponse Ollama");
    choice = JSON.parse(match[0]);
  } catch (err) {
    console.error("Erreur parsing Ollama:", aiResponse);
    throw new Error("Réponse Ollama invalide");
  }

  // ✅ Vérification que l'auditeur existe en base
  const auditor = await User.findById(choice.auditorId);
  if (!auditor) {
    throw new Error("Auditeur invalide renvoyé par Ollama");
  }

  const affectation = new Affectation({
    modeAffectation: "AUTOMATISE",
    statutAffectation: "PROPOSEE",
    tache: task._id,
    auditeur: auditor._id,
    auditeurPropose: auditor._id,
    rapportAlgorithmique: choice.justification
  });

  await affectation.save();
  return affectation;
}

module.exports = { assignTaskAuto };
