export const logger = {
  info: (message: string, meta?: Record<string, unknown>): void => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: Record<string, unknown>): void => {
    const ts = new Date().toISOString();
    console.warn(`[${ts}] [WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: unknown): void => {
    const ts = new Date().toISOString();
    if (error instanceof Error) {
      console.error(`[${ts}] [ERROR] ${message}`, {
        name: error.name, message: error.message, stack: error.stack,
      });
    } else {
      console.error(`[${ts}] [ERROR] ${message}`, error);
    }
  },
  debug: (message: string, meta?: Record<string, unknown>): void => {
    if (process.env.NODE_ENV !== 'production') {
      const ts = new Date().toISOString();
      console.debug(`[${ts}] [DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },
  fatal: (message: string, error?: unknown): void => {
    const ts = new Date().toISOString();
    console.error(`[${ts}] [FATAL] ${message}`, error);
  },
};
