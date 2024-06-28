// controllers/messageController.js
const Message = require('../models/messages');

const getMessages = async (req, res) => {
    const { room } = req.params;
    try {
        const messages = await Message.find({ room }).populate('sender', 'username').sort('createdAt');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
};



module.exports = { getMessages };



