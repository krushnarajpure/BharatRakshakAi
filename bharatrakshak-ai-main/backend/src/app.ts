import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { appConfig } from './config/constants';
import { initCloudinary } from './config/cloudinary';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import routes from './routes';

const createApp = (): Application => {
  const app = express();

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS
  app.use(cors({
    origin: appConfig.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Compression
  app.use(compression());

  // Logging
  if (!appConfig.isProduction) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  app.use('/api/', generalLimiter);

  // Cloudinary
  initCloudinary();

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      message: 'BharatRakshak AI Backend is operational',
      data: {
        status: 'ok',
        service: 'BharatRakshak AI Backend',
        environment: appConfig.nodeEnv,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Routes
  app.use('/api', routes);

  // 404
  app.use(notFoundHandler);

  // Error handler
  app.use(globalErrorHandler);

  return app;
};

export default createApp;
