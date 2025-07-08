import express, { Request } from 'express';
import { auth } from '../middleware/auth.middleware';
import { InventoryItem } from '../models/inventory.model';
import winston from 'winston';
import { IUser } from '../models/user.model';
import {
    getAllInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getFarmInventory
} from '../controllers/inventoryController';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Get all items
router.get('/', auth, getAllInventory);

// Get inventory items for a specific farm
router.get('/farm/:farmId', auth, getFarmInventory);

// Get single item
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const item = await InventoryItem.findOne({ _id: req.params.id, user: req.user?._id });
    if (!item) {
      logger.warn('Inventory item not found', { itemId: req.params.id, userId: req.user?._id });
      return res.status(404).json({ error: 'Item not found' });
    }
    logger.info('Retrieved inventory item', { itemId: req.params.id, userId: req.user?._id });
    res.json(item);
  } catch (error) {
    logger.error('Error retrieving inventory item', { error, itemId: req.params.id, userId: req.user?._id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Create item
router.post('/', auth, createInventoryItem);

// Update item
router.put('/:id', auth, updateInventoryItem);

// Delete item
router.delete('/:id', auth, deleteInventoryItem);

export default router; 