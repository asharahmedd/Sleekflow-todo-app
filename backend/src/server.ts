import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './config/database';
import todoRoutes from './routes/todoRoutes';
import authRoutes from './routes/authRoutes';
import activityRoutes from './routes/activityRoutes';
import commentRoutes from './routes/commentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { initializeSocket } from './services/socketService';
import { initializeEmailService } from './services/emailService';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Initialize Email Service
initializeEmailService();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'TODO API is running' });
});

// Start server (use server.listen instead of app.listen)
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});