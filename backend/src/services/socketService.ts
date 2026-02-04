import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import Activity, { ActivityType } from '../models/Activity';

let io: Server;

export const initializeSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // Frontend URL
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room for real-time updates
    socket.on('join', (userId: string) => {
      socket.join('activity-feed');
      console.log(`User ${userId} joined activity feed`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Broadcast activity to all connected clients
export const broadcastActivity = async (
  type: ActivityType,
  userId: string,
  userName: string,
  message: string,
  data?: {
    todoId?: string;
    todoName?: string;
    oldStatus?: string;
    newStatus?: string;
    oldPriority?: string;
    newPriority?: string;
    sharedWithUserId?: string;
    sharedWithUserName?: string;
    removedUserId?: string;
    removedUserName?: string;
  }
) => {
  try {
    // Save activity to database
    const activity = await Activity.create({
      type,
      userId,
      userName,
      message,
      ...data,
    });

    // Broadcast to all connected clients
    getIO().to('activity-feed').emit('new-activity', {
      id: activity._id,
      type: activity.type,
      userId: activity.userId,
      userName: activity.userName,
      todoId: activity.todoId,
      todoName: activity.todoName,
      oldStatus: activity.oldStatus,
      newStatus: activity.newStatus,
      oldPriority: activity.oldPriority,
      newPriority: activity.newPriority,
      message: activity.message,
      timestamp: activity.timestamp,
    });

    return activity;
  }  catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error broadcasting activity:', error);
    }
  }
};