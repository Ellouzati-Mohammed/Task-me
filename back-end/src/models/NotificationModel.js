const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    typeNotification: { type: String, enum: ['AFFECTATION', 'RAPPEL', 'MODIFICATION', 'ANNULATION'], required: true },
     message: { type: String, required: true }, 
     date: { type: Date, default: Date.now }, 
     lue: { type: Boolean, default: false }, 
     utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
});

module.exports = mongoose.model('Notification', notificationSchema);