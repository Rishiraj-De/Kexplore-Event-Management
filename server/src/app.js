import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import apiRoutes from './routes/index.js';

// Our own Vercel deployments (production + previews) may call the API directly.
const VERCEL_ORIGIN = /^https:\/\/kexplore[a-z0-9-]*\.vercel\.app$/;

export function createApp() {
  const app = express();

  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || env.clientOrigins.includes(origin) || VERCEL_ORIGIN.test(origin)),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(morgan(env.isProd ? ':method :url :status :response-time ms' : 'dev'));

  app.get('/', (_req, res) => res.json({ name: 'Kexplore API', status: 'ok', health: '/api/health' }));
  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
