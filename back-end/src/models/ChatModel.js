const mongoose= require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    titre:{ type: String, required: true },
    conversation:{type:String, enum: ['GoupeTACHE', 'PRIVE'], default:'PRIVE'},
    DateCreation: { type: Date, default: Date.now }});
    
const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;