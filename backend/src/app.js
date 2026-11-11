import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db/index.js';
import { asyncHandler, errorHandler, notFound, rejectNullBytes } from './middleware/errors.js';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import applicationRoutes from './routes/applications.js';
import learningRoutes from './routes/learning.js';
import staffRoutes from './routes/staff.js';
import notificationRoutes from './routes/notifications.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Behind a reverse proxy (Nginx, Render, ...) set TRUST_PROXY so rate limits see each visitor's real IP.
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);

  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store'
    });
    next();
  });

  app.use(cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, tests, server-to-server) are allowed.
      if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false); // browser will block it: the origin is not on the allow-list
    }
  }));
  app.use(express.json({ limit: '100kb' }));
  app.use(rejectNullBytes); // runs after the body is parsed, so it can check URL, query string and JSON body

  app.get('/api/health', asyncHandler(async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', message: 'CampusBridge API and database are connected.' });
    } catch {
      res.status(503).json({ status: 'error', message: 'Database connection failed.' });
    }
  }));

  app.use('/api/auth', authRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/notifications', notificationRoutes);
  // These routers need a login, so they are mounted AFTER the public catalogue only for paths they own.
  app.use('/api', catalogRoutes);
  app.use('/api', learningRoutes);
  app.use('/api', staffRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
