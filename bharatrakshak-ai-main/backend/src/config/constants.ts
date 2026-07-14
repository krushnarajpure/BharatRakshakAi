export const appConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  jwt: {
    secret: process.env.JWT_SECRET || 'default_dev_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  fastapi: {
    baseUrl: process.env.FASTAPI_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.FASTAPI_TIMEOUT || '30000', 10),
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || String(10 * 1024 * 1024), 10),
    maxFiles: parseInt(process.env.MAX_FILES || '5', 10),
  },
} as const;
