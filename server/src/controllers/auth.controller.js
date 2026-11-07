import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { clearSession, issueSession } from '../middleware/auth.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/helpers.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

// 'postmessage' is the redirect URI Google uses for the popup auth-code flow.
const google = new OAuth2Client(env.googleClientId, env.googleClientSecret, 'postmessage');

async function idTokenFrom({ credential, code }) {
  if (credential) return credential; // One Tap / rendered button → ID token directly
  try {
    const { tokens } = await google.getToken(code); // popup auth-code flow → exchange with client secret
    return tokens.id_token;
  } catch {
    throw new HttpError(401, 'Google sign-in expired — please try again');
  }
}

export async function googleSignIn(req, res) {
  const idToken = await idTokenFrom(req.valid.body);

  let payload;
  try {
    const ticket = await google.verifyIdToken({ idToken, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'Could not verify your Google account');
  }
  if (!payload?.email_verified) throw new HttpError(403, 'Your Google email address is not verified');

  const email = payload.email.toLowerCase();
  const profile = { email, name: payload.name || email.split('@')[0], avatar: payload.picture, lastLoginAt: new Date() };

  // Google has verified the address, so an existing email + password account with it is the same person.
  let user = await User.findOne({ googleId: payload.sub });
  if (!user) user = await User.findOne({ email, googleId: { $exists: false } });
  if (user) {
    user.set({ ...profile, googleId: payload.sub });
    await user.save();
  } else {
    user = await User.create({ ...profile, googleId: payload.sub });
  }

  await finishSignIn(res, user);
}

/** Claim tickets booked with this email before the person ever signed in, then start the session. */
async function finishSignIn(res, user) {
  await Registration.updateMany({ email: user.email, user: { $exists: false } }, { $set: { user: user._id } });
  issueSession(res, user);
  res.json({ user });
}

export async function signUp(req, res) {
  const { name, email, password } = req.valid.body;
  const existing = await User.findOne({ email }).select('+passwordHash');
  if (existing?.passwordHash) {
    throw new HttpError(409, 'An account with this email already exists — sign in instead', { email: 'This email is already registered' });
  }
  if (existing) {
    throw new HttpError(409, 'This email signs in with Google — use “Continue with Google”', { email: 'This email uses Google sign-in' });
  }

  const user = await User.create({ name, email, passwordHash: await hashPassword(password), lastLoginAt: new Date() });
  res.status(201);
  await finishSignIn(res, user);
}

// A real hash to compare against when the email is unknown, so response time doesn't reveal which emails exist.
const decoyHash = hashPassword('decoy-password-for-timing');

export async function signInWithPassword(req, res) {
  const { email, password } = req.valid.body;
  const user = await User.findOne({ email }).select('+passwordHash');

  if (user && !user.passwordHash) {
    throw new HttpError(401, 'This email signs in with Google — use “Continue with Google”');
  }
  const ok = await verifyPassword(password, user?.passwordHash ?? (await decoyHash));
  if (!user || !ok) throw new HttpError(401, 'That email and password don’t match');

  user.lastLoginAt = new Date();
  await user.save();
  await finishSignIn(res, user);
}

export function me(req, res) {
  res.set('Cache-Control', 'private, no-store');
  res.json({ user: req.user ?? null });
}

export function logout(_req, res) {
  clearSession(res);
  res.json({ ok: true });
}
