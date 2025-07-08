import express from 'express';
import { auth } from '../middleware/auth.middleware';
import {
    createActivity,
    getFarmActivities,
    updateActivityStatus,
    getActivityDetails
} from '../controllers/activityController';

const router = express.Router();

// Create a new activity
router.post('/', auth, createActivity);

// Get activities for a specific farm
router.get('/farm/:farmId', auth, getFarmActivities);

// Update activity status
router.patch('/:activityId/status', auth, updateActivityStatus);

// Get activity details
router.get('/:activityId', auth, getActivityDetails);

export default router; 