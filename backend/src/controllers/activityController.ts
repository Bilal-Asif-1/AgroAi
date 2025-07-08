import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Activity } from '../models/activity.model';
import { InventoryItem } from '../models/inventory.model';
import mongoose from 'mongoose';

// Create a new activity
export const createActivity = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { farm, type, description, date, inventoryItems, notes } = req.body;

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create the activity
            const activity = await Activity.create([{
                farm,
                user: userId,
                type,
                description,
                date,
                inventoryItems,
                notes,
                status: 'Planned'
            }], { session });

            // Update inventory stock levels
            for (const item of inventoryItems) {
                await InventoryItem.findOneAndUpdate(
                    { _id: item.item, user: userId },
                    { 
                        $inc: { quantity: -item.quantity },
                        $push: { farms: farm }
                    },
                    { session }
                );
            }

            await session.commitTransaction();
            res.status(201).json(activity[0]);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ error: 'Failed to create activity' });
    }
};

// Get activities for a farm
export const getFarmActivities = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { farmId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const activities = await Activity.find({ farm: farmId, user: userId })
            .populate('inventoryItems.item')
            .sort({ date: -1 });

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
};

// Update activity status
export const updateActivityStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { activityId } = req.params;
        const { status } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const activity = await Activity.findOneAndUpdate(
            { _id: activityId, user: userId },
            { status },
            { new: true }
        );

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json(activity);
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ error: 'Failed to update activity' });
    }
};

// Get activity details
export const getActivityDetails = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { activityId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const activity = await Activity.findOne({ _id: activityId, user: userId })
            .populate('inventoryItems.item')
            .populate('farm');

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity details:', error);
        res.status(500).json({ error: 'Failed to fetch activity details' });
    }
}; 