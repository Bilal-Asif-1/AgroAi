import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { Farm } from '../models/farm.model';
import { InventoryItem } from '../models/inventory.model';
import { Activity } from '../models/activity.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { ChatMessage } from '../models/chat.model';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDOlnSVFUEXfFI9Fvb5QDQzZ21kd-mhEbk';
console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : 'Not found');
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `You are a direct and concise AI assistant for an inventory management system. Your responses should be:
1. Data-driven: Always use the provided data to answer questions
2. Direct: Give clear, specific answers without asking for clarification unless absolutely necessary
3. Concise: Keep responses brief and to the point
4. Accurate: Only provide information that is present in the data

When asked about farms, inventory, or activities, use the provided data to give exact numbers and details. You can help with:
- Farm information and status
- Inventory levels and usage
- Activity tracking and history
- Activity status and progress
- Inventory items used in activities`;

export const chatWithBot = async (req: AuthRequest, res: Response) => {
    try {
        const { message } = req.body;
        const userId = req.user?._id;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!apiKey) {
            console.error('No Gemini API key available.');
            return res.status(500).json({ error: 'No Gemini API key available.' });
        }

        // Fetch relevant data based on the message
        let contextData = '';
        
        // Always fetch farms data for context
        const farms = await Farm.find({ user: userId });
        contextData += `\nCurrent Farms Data:\n${JSON.stringify(farms, null, 2)}`;

        // Always fetch inventory data for context
        const inventory = await InventoryItem.find({ user: userId });
        contextData += `\nCurrent Inventory Data:\n${JSON.stringify(inventory, null, 2)}`;

        // Always fetch activities data for context
        const activities = await Activity.find({ user: userId })
            .populate('inventoryItems.item')
            .sort({ date: -1 });
        contextData += `\nCurrent Activities Data:\n${JSON.stringify(activities, null, 2)}`;

        // Get the model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Generate content with system prompt and context data
        const result = await model.generateContent(
            `${SYSTEM_PROMPT}\n\nContext Data:${contextData}\n\nUser: ${message}\n\nInstructions: Use the provided data to give a direct and specific answer. If the data shows the exact number of farms, inventory items, or activities, state that number clearly. For activities, include their status and any inventory items used.`
        );
        
        const response = await result.response;
        const text = response.text().replace(/\*/g, ''); // Remove asterisks

        // Store the chat message and response
        await ChatMessage.create({
            user: userId,
            message: message,
            response: text
        });

        res.json({ response: text });
    } catch (error) {
        console.error('Chatbot error details:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({ 
            error: 'Failed to process chat request',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 