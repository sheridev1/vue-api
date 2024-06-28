const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    sentBy: {
        type: String, // 'user' or 'admin' to distinguish who sent the message
        enum: ['user', 'admin'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
