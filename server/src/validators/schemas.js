import { z } from 'zod';
import { CATEGORIES, EVENT_MODES, MAX_TICKETS_PER_REGISTRATION } from '../utils/constants.js';

const NAME_RE = /^[\p{L}][\p{L} .'-]{1,59}$/u;

/** Strip spaces, dashes and brackets so "+91 98765-43210" → "+919876543210". */
export const normalizePhone = (value) => String(value ?? '').replace(/[\s\-().]/g, '');

const phone = z
  .string()
  .transform(normalizePhone)
  .refine((v) => /^\+[1-9]\d{7,14}$/.test(v), 'Enter a valid phone number with country code')
  .refine((v) => !v.startsWith('+91') || /^\+91[6-9]\d{9}$/.test(v), 'Indian mobile numbers have 10 digits and start with 6–9');

export const registrationSchema = z.object({
  eventId: z.string().regex(/^[a-f\d]{24}$/i, 'Choose an event'),
  name: z.string().trim().regex(NAME_RE, 'Use 2–60 letters (spaces, . \' - allowed)'),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
  phone,
  organization: z.string().trim().max(80).optional().or(z.literal('')),
  tickets: z.coerce.number().int().min(1).max(MAX_TICKETS_PER_REGISTRATION).default(1),
});

export const cancelSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()).optional(),
});

export const syncSchema = z.object({
  codes: z.array(z.string().regex(/^KX-[A-Z0-9]{4}-[A-Z0-9]{4}$/)).max(100),
});

export const eventQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORIES).optional().catch(undefined),
  when: z.enum(['upcoming', 'week', 'month', 'past', 'all']).default('upcoming').catch('upcoming'),
  mode: z.enum(['offline', 'online']).optional().catch(undefined),
  price: z.enum(['free', 'paid']).optional().catch(undefined),
  sort: z.enum(['date', 'popular', 'newest', 'price']).default('date').catch('date'),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).max(500).default(1).catch(1),
  limit: z.coerce.number().int().min(1).max(50).default(12).catch(12),
});

const httpsUrl = z.url({ protocol: /^https$/, message: 'Use an https:// image URL' });

export const createEventSchema = z
  .object({
    title: z.string().trim().min(5, 'Title is too short').max(120),
    tagline: z.string().trim().max(160).optional().or(z.literal('')),
    shortDescription: z.string().trim().min(20, 'Write at least 20 characters').max(240),
    description: z.string().trim().min(60, 'Describe the event in at least 60 characters').max(6000),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string().trim().min(1).max(24)).max(8).default([]),
    coverImage: httpsUrl,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    mode: z.enum(EVENT_MODES).default('offline'),
    venue: z.object({
      name: z.string().trim().min(2).max(120),
      address: z.string().trim().max(200).optional().or(z.literal('')),
      city: z.string().trim().min(2).max(60),
    }),
    price: z.coerce.number().min(0).max(100000).default(0),
    capacity: z.coerce.number().int().min(1).max(100000),
  })
  .refine((e) => e.endDate > e.startDate, { path: ['endDate'], message: 'End must be after the start' })
  .refine((e) => e.startDate > new Date(), { path: ['startDate'], message: 'Start must be in the future' });

export const googleAuthSchema = z
  .object({ credential: z.string().min(20).optional(), code: z.string().min(10).optional() })
  .refine((b) => b.credential || b.code, 'Missing Google credential');

const accountEmail = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'));

export const signUpSchema = z.object({
  name: z.string().trim().regex(NAME_RE, 'Use 2–60 letters (spaces, . \' - allowed)'),
  email: accountEmail,
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .max(72, 'Use at most 72 characters')
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'Mix letters and numbers'),
});

export const signInSchema = z.object({
  email: accountEmail,
  password: z.string().min(1, 'Enter your password').max(72),
});

export const ratingSchema = z.object({
  value: z.coerce.number().int().min(0).max(5), // 0 clears your rating
});
