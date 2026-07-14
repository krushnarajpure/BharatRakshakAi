import dotenv from 'dotenv';
dotenv.config();

import createApp from './app';
import connectDB from './config/db';
import { appConfig } from './config/constants';
import { logger } from './utils/logger';

process.on('unhandledRejection', (reason: Error) => {
  logger.fatal('UNHANDLED REJECTION — Shutting down...', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.fatal('UNCAUGHT EXCEPTION — Shutting down...', error);
  process.exit(1);
});

const startServer = async (): Promise<void> => {
  await connectDB();

  const app = createApp();

  const server = app.listen(appConfig.port, () => {
    logger.info(`BharatRakshak AI Backend running on port ${appConfig.port}`, {
      environment: appConfig.nodeEnv,
      port: appConfig.port,
    });
  });

  const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.fatal('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.fatal('Failed to start server', error);
  process.exit(1);
});