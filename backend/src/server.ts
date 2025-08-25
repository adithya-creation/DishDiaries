import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { database } from '@/config/database';
import { logger, morganStream } from '@/utils/logger';
import { errorHandler, notFound, unhandledRejectionHandler, uncaughtExceptionHandler } from '@/middleware/errorHandler';
import { apiLimiter } from '@/middleware/rateLimiter';

// Import routes
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/userRoutes';
import recipeRoutes from '@/routes/recipeRoutes';
import uploadRoutes from '@/routes/uploadRoutes';

// Import socket configuration
import { initializeSocket } from '@/socket/socketHandler';

// Handle uncaught exceptions and unhandled rejections
uncaughtExceptionHandler();
unhandledRejectionHandler();

class Server {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000');
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupSocket();
  }

  private setupMiddleware(): void {
    // Trust proxy (for deployment behind reverse proxy)
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Logging middleware
    this.app.use(morgan('combined', { stream: morganStream }));

    // Rate limiting
    this.app.use('/api', apiLimiter);

    // Health check endpoint
    this.app.get('/health', async (req: any, res: any) => {
      const healthCheck = await database.healthCheck();
      
      res.status(healthCheck.status === 'healthy' ? 200 : 503).json({
        status: healthCheck.status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: healthCheck.message,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API info endpoint
    this.app.get('/api', (req: any, res: any) => {
      res.json({
        name: 'DishDiaries API',
        version: '1.0.0',
        description: 'Backend API for DishDiaries recipe sharing platform',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          recipes: '/api/recipes',
          upload: '/api/upload'
        }
      });
    });
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/recipes', recipeRoutes);
    this.app.use('/api/upload', uploadRoutes);

    // 404 handler for undefined routes
    this.app.use('*', notFound);
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);
  }

  private setupSocket(): void {
    // Initialize Socket.io with authentication and event handlers
    initializeSocket(this.io);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();
      logger.info('Database connection established');

      // Start server
      this.server.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
        logger.info(`API documentation: http://localhost:${this.port}/api`);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      // Close HTTP server
      this.server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close Socket.io server
      this.io.close(() => {
        logger.info('Socket.io server closed');
      });

      // Close database connection
      try {
        await database.disconnect();
        logger.info('Database connection closed');
      } catch (error) {
        logger.error('Error closing database connection:', error);
      }

      process.exit(0);
    };

    // Handle graceful shutdown
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Create and start server
const server = new Server();
server.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default server; 