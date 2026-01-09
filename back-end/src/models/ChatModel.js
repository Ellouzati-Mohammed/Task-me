const mongoose= require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    titre:{ type: String, required: false },
    conversation:{type:String, enum: ['GoupeTACHE', 'PRIVE'], default:'PRIVE'},
    tache: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
    DateCreation: { type: Date, default: Date.now }
}, { timestamps: true });
    
const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;