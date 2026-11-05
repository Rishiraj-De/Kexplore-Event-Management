import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { clearSession, issueSession } from '../middleware/auth.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/helpers.js';

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

  const user = await User.findOneAndUpdate(
    { googleId: payload.sub },
    {
      $set: {
        email: payload.email.toLowerCase(),
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture,
        lastLoginAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );

  // Claim tickets booked with this email before the person ever signed in.
  await Registration.updateMany({ email: user.email, user: { $exists: false } }, { $set: { user: user._id } });

  issueSession(res, user);
  res.json({ user });
}

export function me(req, res) {
  res.set('Cache-Control', 'private, no-store');
  res.json({ user: req.user ?? null });
}

export function logout(_req, res) {
  clearSession(res);
  res.json({ ok: true });
}
