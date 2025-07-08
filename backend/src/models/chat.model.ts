import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
    user: mongoose.Types.ObjectId;
    message: string;
    response: string;
    timestamp: Date;
}

const chatMessageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema); 