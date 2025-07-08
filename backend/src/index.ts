import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import inventoryRoutes from './routes/inventory.routes';
import farmRoutes from './routes/farm.routes';
import supplierRoutes from './routes/supplier.routes';
import chatbotRoutes from './routes/chatbotRoutes';
import activityRoutes from './routes/activityRoutes';
import marketAIRoutes from './routes/marketAIRoutes';
import pestDetectionRoutes from './routes/pestDetection.routes';

dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/market', marketAIRoutes);
app.use('/api', pestDetectionRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
}); 