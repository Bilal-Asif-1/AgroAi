import express from 'express';
import { chatWithBot } from '../controllers/chatbotController';
import { auth, AuthRequest } from '../middleware/auth.middleware';
import { ChatMessage } from '../models/chat.model';
import { Response } from 'express';

const router = express.Router();

router.post('/chat', auth, chatWithBot);

// Get chat history
router.get('/history', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const messages = await ChatMessage.find({ user: userId })
            .sort({ timestamp: -1 })
            .limit(50); // Get last 50 messages
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

export default router; 