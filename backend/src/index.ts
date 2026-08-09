import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { logger } from './config/logger';
import { initializeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();
let isInitialized = false;

async function initApp() {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

// Ensure DB is initialized before handling any requests
app.use(async (_req, _res, next) => {
  try {
    await initApp();
    next();
  } catch (err) {
    next(err);
  }
});

// Security headers — allow static frontend assets
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Rate limiting — 100 requests per 15 minutes per IP on API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMITED',
  },
});
app.use('/api', limiter);

// Stricter rate limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMITED',
  },
});
app.use('/api/auth', authLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── API Routes ───────────────────────────────────────────────────
app.use('/api', routes);

// ── Static Frontend Serving ──────────────────────────────────────
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// SPA Catch-all: serve index.html for any client-side route
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// ── Global error handler (MUST be last) ─────────────────────────
app.use(errorHandler);

// Start server if executed directly (not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
  initApp().then(() => {
    app.listen(env.PORT, () => {
      logger.info(`🚀 Fullstack Habit Tracker Application live on http://localhost:${env.PORT}`);
      logger.info(`📋 Environment: ${env.NODE_ENV}`);
      logger.info(`🗄️  Database: ${env.DATABASE_URL}`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
