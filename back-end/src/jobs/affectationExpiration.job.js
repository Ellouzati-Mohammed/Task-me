const schedule = require('node-schedule');
const Affectation = require('../models/AffectationModel.js');

// Scheduler global : toutes les 10 minutes
schedule.scheduleJob('0 0 */2 * * *', async function() {
  try {
    console.log("start job affectation Expiration")
    const now = new Date();

    // Chercher les affectations "PROPOSEE" qui ont dépassé expiresAt
    const expiredAffectations = await Affectation.find({
      statutAffectation: "PROPOSEE",
      expiresAt: { $lte: now }
    });

    for (const aff of expiredAffectations) {
      aff.statutAffectation = "REFUSEE"; // changer le statut
      await aff.save();
      console.log(`Affectation ${aff._id} a été refusée automatiquement`);
    }

    if (expiredAffectations.length > 0) {
      console.log(`Total affectations expirées mises à jour : ${expiredAffectations.length}`);
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour des affectations expirées :", err);
  }
});
