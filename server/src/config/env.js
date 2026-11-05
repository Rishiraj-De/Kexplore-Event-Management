import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Load server/.env in local development. On Render the variables come from the dashboard.
const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const required = ['MONGODB_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`✖ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const isProd = process.env.NODE_ENV === 'production';

export const env = Object.freeze({
  isProd,
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  // Comma-separated list of front-end origins allowed to call the API directly.
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
  cookieName: 'kx_session',
  sessionDays: 7,
});
