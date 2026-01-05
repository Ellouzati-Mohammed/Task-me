const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  contenu: {
    type: String,
    required: true
  },
  piecesJointes: [{
    type: String   // fichiers joints
  }],
  dateEnvoi: {
    type: Date,
    default: Date.now
  },
  lu: {
    type: Boolean,
    default: false
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',   // <-- correction ici
    required: true
  },
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

