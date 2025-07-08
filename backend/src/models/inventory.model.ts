import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
    name: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    price: number;
    supplier: string;
    user: mongoose.Types.ObjectId;
    farms: mongoose.Types.ObjectId[];
    stockLevel: number;
    minimumStockLevel: number;
    lastRestocked: Date;
    createdAt: Date;
    updatedAt: Date;
}

const inventoryItemSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Tools', 'Other']
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'g', 'l', 'ml', 'piece', 'box', 'pack']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    supplier: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farms: [{
        type: Schema.Types.ObjectId,
        ref: 'Farm'
    }],
    stockLevel: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    minimumStockLevel: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    lastRestocked: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add index for faster queries
inventoryItemSchema.index({ user: 1, name: 1 }, { unique: true });
inventoryItemSchema.index({ farms: 1 });

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema); 