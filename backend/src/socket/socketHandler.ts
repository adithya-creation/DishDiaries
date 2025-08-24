import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketAuth } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { SocketUser, SocketEvents } from '@/types';

// Store connected users
const connectedUsers = new Map<string, SocketUser>();

export const initializeSocket = (io: SocketIOServer): void => {
  // Apply authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    const userId = (socket as any).userId;

    // Store connected user
    const socketUser: SocketUser = {
      userId,
      username: user.username,
      socketId: socket.id
    };

    connectedUsers.set(userId, socketUser);

    logger.info('User connected to socket', {
      userId,
      username: user.username,
      socketId: socket.id,
      totalConnected: connectedUsers.size
    });

    // Emit user online status to their followers
    socket.broadcast.emit('user-status', {
      userId,
      online: true
    });

    // Handle joining recipe rooms
    socket.on('join-recipe', (data: { recipeId: string }) => {
      const { recipeId } = data;
      socket.join(`recipe:${recipeId}`);
      
      logger.debug('User joined recipe room', {
        userId,
        recipeId,
        socketId: socket.id
      });
    });

    // Handle leaving recipe rooms
    socket.on('leave-recipe', (data: { recipeId: string }) => {
      const { recipeId } = data;
      socket.leave(`recipe:${recipeId}`);
      
      logger.debug('User left recipe room', {
        userId,
        recipeId,
        socketId: socket.id
      });
    });

    // Handle recipe likes
    socket.on('like-recipe', (data: { recipeId: string; userId: string }) => {
      const { recipeId } = data;
      
      // Broadcast to all users in the recipe room
      socket.to(`recipe:${recipeId}`).emit('new-like', {
        recipeId,
        userId,
        username: user.username
      });

      logger.debug('Recipe liked via socket', {
        userId,
        recipeId,
        socketId: socket.id
      });
    });

    // Handle recipe comments
    socket.on('add-comment', (data: { recipeId: string; comment: any }) => {
      const { recipeId, comment } = data;
      
      // Broadcast to all users in the recipe room
      socket.to(`recipe:${recipeId}`).emit('new-comment', {
        recipeId,
        comment: {
          ...comment,
          user: {
            _id: userId,
            username: user.username,
            avatar: user.avatar
          }
        }
      });

      logger.debug('Comment added via socket', {
        userId,
        recipeId,
        socketId: socket.id
      });
    });

    // Handle user going online
    socket.on('user-online', () => {
      socket.broadcast.emit('user-status', {
        userId,
        online: true
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      // Remove user from connected users
      connectedUsers.delete(userId);

      // Emit user offline status
      socket.broadcast.emit('user-status', {
        userId,
        online: false
      });

      logger.info('User disconnected from socket', {
        userId,
        username: user.username,
        socketId: socket.id,
        reason,
        totalConnected: connectedUsers.size
      });
    });

    // Handle socket errors
    socket.on('error', (error: Error) => {
      logger.error('Socket error', {
        userId,
        socketId: socket.id,
        error: error.message,
        stack: error.stack
      });
    });
  });

  // Handle Socket.io server errors
  io.on('error', (error: Error) => {
    logger.error('Socket.io server error', {
      error: error.message,
      stack: error.stack
    });
  });
};

// Helper functions to emit events from other parts of the application

export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any): void => {
  const user = connectedUsers.get(userId);
  if (user) {
    io.to(user.socketId).emit(event, data);
  }
};

export const emitToRecipeRoom = (io: SocketIOServer, recipeId: string, event: string, data: any): void => {
  io.to(`recipe:${recipeId}`).emit(event, data);
};

export const emitToAllUsers = (io: SocketIOServer, event: string, data: any): void => {
  io.emit(event, data);
};

export const getConnectedUsers = (): SocketUser[] => {
  return Array.from(connectedUsers.values());
};

export const isUserConnected = (userId: string): boolean => {
  return connectedUsers.has(userId);
}; 