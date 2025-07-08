import { Response } from 'express';
import { InventoryItem } from '../models/inventory.model';
import { AuthRequest } from '../types/express';

// Get all inventory items for a user
export const getAllInventory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const inventoryItems = await InventoryItem.find({ user: userId })
            .populate('supplier', 'name');

        res.json(inventoryItems);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
};

// Get inventory items for a specific farm
export const getFarmInventory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { farmId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const inventoryItems = await InventoryItem.find({
            user: userId,
            farms: farmId,
            stockLevel: { $gt: 0 } // Only return items with stock available
        }).populate('supplier', 'name');

        res.json(inventoryItems);
    } catch (error) {
        console.error('Error fetching farm inventory:', error);
        res.status(500).json({ error: 'Failed to fetch farm inventory' });
    }
};

// Create a new inventory item
export const createInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const inventoryItem = new InventoryItem({
            ...req.body,
            user: userId
        });

        await inventoryItem.save();
        res.status(201).json(inventoryItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Failed to create inventory item' });
    }
};

// Update an inventory item
export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const inventoryItem = await InventoryItem.findOneAndUpdate(
            { _id: id, user: userId },
            req.body,
            { new: true }
        );

        if (!inventoryItem) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        res.json(inventoryItem);
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
};

// Delete an inventory item
export const deleteInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const inventoryItem = await InventoryItem.findOneAndDelete({
            _id: id,
            user: userId
        });

        if (!inventoryItem) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ error: 'Failed to delete inventory item' });
    }
}; 