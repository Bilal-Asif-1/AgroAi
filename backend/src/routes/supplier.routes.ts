import express, { Request } from 'express';
import { auth } from '../middleware/auth.middleware';
import { Supplier } from '../models/supplier.model';
import winston from 'winston';
import { IUser } from '../models/user.model';

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

// Get all suppliers
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const suppliers = await Supplier.find({ user: req.user?._id });
    logger.info('Retrieved all suppliers', { userId: req.user?._id });
    res.json(suppliers);
  } catch (error) {
    logger.error('Error retrieving suppliers', { error, userId: req.user?._id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single supplier
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, user: req.user?._id });
    if (!supplier) {
      logger.warn('Supplier not found', { supplierId: req.params.id, userId: req.user?._id });
      return res.status(404).json({ error: 'Supplier not found' });
    }
    logger.info('Retrieved supplier', { supplierId: req.params.id, userId: req.user?._id });
    res.json(supplier);
  } catch (error) {
    logger.error('Error retrieving supplier', { error, supplierId: req.params.id, userId: req.user?._id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Create supplier
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const supplier = new Supplier({
      ...req.body,
      user: req.user?._id
    });
    await supplier.save();
    logger.info('Created new supplier', { supplierId: supplier._id, userId: req.user?._id });
    res.status(201).json(supplier);
  } catch (error) {
    logger.error('Error creating supplier', { error, userId: req.user?._id });
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Update supplier
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      req.body,
      { new: true }
    );
    if (!supplier) {
      logger.warn('Supplier not found for update', { supplierId: req.params.id, userId: req.user?._id });
      return res.status(404).json({ error: 'Supplier not found' });
    }
    logger.info('Updated supplier', { supplierId: req.params.id, userId: req.user?._id });
    res.json(supplier);
  } catch (error) {
    logger.error('Error updating supplier', { error, supplierId: req.params.id, userId: req.user?._id });
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Delete supplier
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const supplier = await Supplier.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    if (!supplier) {
      logger.warn('Supplier not found for deletion', { supplierId: req.params.id, userId: req.user?._id });
      return res.status(404).json({ error: 'Supplier not found' });
    }
    logger.info('Deleted supplier', { supplierId: req.params.id, userId: req.user?._id });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    logger.error('Error deleting supplier', { error, supplierId: req.params.id, userId: req.user?._id });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 