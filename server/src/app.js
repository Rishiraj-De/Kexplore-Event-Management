import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import apiRoutes from './routes/index.js';

// Production front-ends plus this project's Vercel preview deployments may call the API directly.
// (In production the browser normally goes through Vercel's same-origin /api rewrite instead.)
const PRODUCTION_ORIGINS = ['https://kexplore-events.vercel.app', 'https://kexplore-ten.vercel.app'];
const VERCEL_PREVIEW = /^https:\/\/kexplore-[a-z0-9]+-skynet16\.vercel\.app$/;

export function createApp() {
  const app = express();

  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, cb) =>
        cb(null, !origin || PRODUCTION_ORIGINS.includes(origin) || env.clientOrigins.includes(origin) || VERCEL_PREVIEW.test(origin)),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(morgan(env.isProd ? ':method :url :status :response-time ms' : 'dev'));

  app.get('/', (_req, res) => res.json({ name: 'Summit API', status: 'ok', health: '/api/health' }));
  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
