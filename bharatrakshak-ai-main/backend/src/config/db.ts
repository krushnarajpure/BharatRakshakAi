import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      logger.fatal('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`, {
      database: conn.connection.name,
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });
  } catch (error) {
    logger.fatal('MongoDB Connection Failed', error);
    process.exit(1);
  }
};

export default connectDB;