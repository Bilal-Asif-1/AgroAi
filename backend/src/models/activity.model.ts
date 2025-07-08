import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    farm: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    type: string;
    description: string;
    date: Date;
    inventoryItems: {
        item: mongoose.Types.ObjectId;
        quantity: number;
        unit: string;
    }[];
    status: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const activitySchema = new Schema({
    farm: {
        type: Schema.Types.ObjectId,
        ref: 'Farm',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Planting', 'Fertilizing', 'Pest Control', 'Irrigation', 'Harvesting', 'Maintenance', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    inventoryItems: [{
        item: {
            type: Schema.Types.ObjectId,
            ref: 'InventoryItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            required: true
        }
    }],
    status: {
        type: String,
        required: true,
        enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Planned'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Add indexes for faster queries
activitySchema.index({ farm: 1, date: -1 });
activitySchema.index({ user: 1 });
activitySchema.index({ 'inventoryItems.item': 1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema); 