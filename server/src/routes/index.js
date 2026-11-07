import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { dbState } from '../config/db.js';
import * as auth from '../controllers/auth.controller.js';
import * as events from '../controllers/events.controller.js';
import * as registrations from '../controllers/registrations.controller.js';
import * as users from '../controllers/users.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  cancelSchema,
  createEventSchema,
  eventQuerySchema,
  googleAuthSchema,
  ratingSchema,
  registrationSchema,
  signInSchema,
  signUpSchema,
  syncSchema,
} from '../validators/schemas.js';

const limiter = (limit, windowMinutes) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    // Behind Vercel + Render proxies the client IP arrives via X-Forwarded-For.
    validate: { trustProxy: false, xForwardedForHeader: false },
    message: { error: 'Too many requests — please slow down and try again shortly' },
  });

const router = Router();

router.use(limiter(600, 15));
router.use(optionalAuth);

router.get('/health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok', db: dbState(), uptime: Math.round(process.uptime()), time: new Date().toISOString() });
});

// Auth
router.post('/auth/google', limiter(30, 15), validate(googleAuthSchema), auth.googleSignIn);
router.post('/auth/signup', limiter(10, 60), validate(signUpSchema), auth.signUp);
router.post('/auth/login', limiter(20, 15), validate(signInSchema), auth.signInWithPassword);
router.get('/auth/me', auth.me);
router.post('/auth/logout', auth.logout);

// Events
router.get('/events', validate(eventQuerySchema, 'query'), events.listEvents);
router.get('/events/meta', events.getMeta);
router.get('/events/hosted', requireAuth, events.listHostedEvents);
router.get('/events/:id/attendees', requireAuth, events.listAttendees);
router.get('/events/:slug', events.getEvent);
router.post('/events', requireAuth, limiter(10, 60), validate(createEventSchema), events.createEvent);

// Registrations
router.post('/registrations', limiter(20, 10), validate(registrationSchema), registrations.createRegistration);
router.get('/registrations/me', requireAuth, registrations.myRegistrations);
router.post('/registrations/sync', validate(syncSchema), registrations.syncRegistrations);
router.get('/registrations/:code', registrations.getRegistration);
router.patch('/registrations/:code/cancel', limiter(20, 10), validate(cancelSchema), registrations.cancelRegistration);

// Bookmarks
router.get('/users/me/bookmarks', requireAuth, users.listBookmarks);
router.put('/users/me/bookmarks/:eventId', requireAuth, users.toggleBookmark);

// Ratings
router.get('/users/me/ratings', requireAuth, users.listMyRatings);
router.put('/events/:eventId/rating', requireAuth, limiter(60, 15), validate(ratingSchema), users.rateEvent);

export default router;
