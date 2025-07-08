import { Response } from 'express';
import { Farm } from '../models/farm.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const createFarm = async (req: AuthRequest, res: Response) => {
  try {
    const { name, area, city, pesticides, waterStatus } = req.body;
    const userId = req.user?._id || req.body.user;
    if (!userId) return res.status(400).json({ error: 'User is required' });
    const farm = new Farm({ name, area, city, pesticides, waterStatus, user: userId });
    await farm.save();
    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create farm' });
  }
};

export const getFarmsByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.query.user || req.params.userId;
    if (!userId) return res.status(400).json({ error: 'User is required' });
    const farms = await Farm.find({ user: userId });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
};

export const getAllFarms = async (_req: AuthRequest, res: Response) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
}; 

export const updateFarm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, area, city, pesticides, waterStatus } = req.body;
    const farm = await Farm.findByIdAndUpdate(
      id,
      { name, area, city, pesticides, waterStatus },
      { new: true }
    );
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    res.json(farm);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update farm' });
  }
};

export const deleteFarm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const farm = await Farm.findByIdAndDelete(id);
    res.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete farm' });
  }
};