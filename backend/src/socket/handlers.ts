import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { redis } from '../config/redis';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
    name: string;
  };
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Get user details
      const user = await User.findById(decoded.userId).select('name email role');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      };

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 User ${socket.user?.name} connected`);

    // Join user to their personal room
    if (socket.user) {
      socket.join(`user:${socket.user.userId}`);
    }

    // Handle chat messages
    socket.on('chat:message', async (data) => {
      try {
        if (!socket.user) return;

        const message = {
          id: Date.now().toString(),
          userId: socket.user.userId,
          name: socket.user.name,
          message: data.message,
          timestamp: new Date(),
        };

        // Broadcast to all clients except sender
        socket.broadcast.emit('chat:message', message);

        // Store in Redis for history
        const room = data.room || 'global';
        const key = `chat:history:${room}`;
        const history = await redis.getJSON(key) || [];
        history.push(message);
        
        // Keep only last 100 messages
        if (history.length > 100) {
          history.splice(0, history.length - 100);
        }

        await redis.setJSON(key, history, 86400); // 24 hours
      } catch (error) {
        console.error('Socket chat message error:', error);
      }
    });

    // Handle joining rooms
    socket.on('room:join', (roomName) => {
      socket.join(roomName);
      socket.emit('room:joined', roomName);
    });

    // Handle leaving rooms
    socket.on('room:leave', (roomName) => {
      socket.leave(roomName);
      socket.emit('room:left', roomName);
    });

    // Handle typing indicators
    socket.on('chat:typing', (data) => {
      socket.broadcast.emit('chat:typing', {
        userId: socket.user?.userId,
        name: socket.user?.name,
        isTyping: data.isTyping,
      });
    });

    // Handle notifications
    socket.on('notification:subscribe', (channels) => {
      if (Array.isArray(channels)) {
        channels.forEach(channel => {
          socket.join(`notifications:${channel}`);
        });
      }
    });

    // Handle leaderboard updates
    socket.on('leaderboard:subscribe', () => {
      socket.join('leaderboard:updates');
    });

    // Handle project updates
    socket.on('project:subscribe', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    // Handle event updates
    socket.on('event:subscribe', (eventId) => {
      socket.join(`event:${eventId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.user?.name} disconnected`);
    });
  });
};

// Helper function to emit to specific users
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit to specific rooms
export const emitToRoom = (io: Server, room: string, event: string, data: any) => {
  io.to(room).emit(event, data);
};

// Helper function to emit to all connected clients
export const emitToAll = (io: Server, event: string, data: any) => {
  io.emit(event, data);
};
