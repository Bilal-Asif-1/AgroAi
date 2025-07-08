import express from 'express';
import { createFarm, getFarmsByUser, getAllFarms, deleteFarm, updateFarm } from '../controllers/farm.controller';
// import { auth } from '../middleware/auth.middleware'; // Uncomment if you want to protect routes

const router = express.Router();

// Create a new farm
router.post('/', /*auth,*/ createFarm);

// Get all farms
router.get('/', getAllFarms);

// Get farms by user (optionally protected)
router.get('/user/:userId', getFarmsByUser);

// Update farm
router.put('/:id', updateFarm);

// Delete farm
router.delete('/:id', deleteFarm);

export default router; 