import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/helpers.js';

export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax',
  path: '/',
  maxAge: env.sessionDays * 24 * 60 * 60 * 1000,
};

export function issueSession(res, user) {
  const token = jwt.sign({ sub: String(user._id) }, env.jwtSecret, { expiresIn: `${env.sessionDays}d` });
  res.cookie(env.cookieName, token, sessionCookieOptions);
}

export function clearSession(res) {
  const { maxAge: _maxAge, ...rest } = sessionCookieOptions;
  res.clearCookie(env.cookieName, rest);
}

/** Attaches `req.user` when a valid session cookie is present; never rejects. */
export async function optionalAuth(req, _res, next) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return next();
  try {
    const { sub } = jwt.verify(token, env.jwtSecret);
    req.user = await User.findById(sub);
  } catch {
    // Expired or tampered token → treat as signed out.
  }
  next();
}

export function requireAuth(req, _res, next) {
  if (!req.user) throw new HttpError(401, 'Please sign in with Google to continue');
  next();
}
