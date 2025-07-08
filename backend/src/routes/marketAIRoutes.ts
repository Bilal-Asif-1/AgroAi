import { Router } from 'express';
import { getAICropData } from '../controllers/marketAIController';

const router = Router();

router.get('/ai-crop-data', getAICropData);

export default router; 