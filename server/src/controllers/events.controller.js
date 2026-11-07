import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { escapeRegex, HttpError, slugify } from '../utils/helpers.js';

const DAY = 24 * 60 * 60 * 1000;

/** Fields needed to render an event card — keeps list payloads small. */
export const CARD_FIELDS =
  'title slug tagline shortDescription category tags coverImage startDate endDate mode venue price currency capacity registeredCount featured organizer.name ratingCount ratingTotal savesCount';

// Event lists are identical for every visitor, so let the CDN (Vercel edge) cache them briefly
// and serve a stale copy while it revalidates. This keeps the UI instant even if the API is waking up.
const setPublicCache = (res, sMaxAge = 30) =>
  res.set('Cache-Control', `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=600`);

function buildFilter({ q, category, when, mode, price, featured }) {
  const now = new Date();
  const filter = { status: 'published' };

  if (category) filter.category = category;
  if (featured !== undefined) filter.featured = featured;
  if (mode === 'online') filter.mode = 'online';
  if (mode === 'offline') filter.mode = { $in: ['offline', 'hybrid'] };
  if (price === 'free') filter.price = 0;
  if (price === 'paid') filter.price = { $gt: 0 };

  if (when === 'upcoming') filter.endDate = { $gte: now };
  if (when === 'past') filter.endDate = { $lt: now };
  if (when === 'week' || when === 'month') {
    filter.endDate = { $gte: now };
    filter.startDate = { $lte: new Date(now.getTime() + (when === 'week' ? 7 : 31) * DAY) };
  }

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [
      { title: rx },
      { shortDescription: rx },
      { tags: rx },
      { category: rx },
      { 'venue.name': rx },
      { 'venue.city': rx },
      { 'organizer.name': rx },
    ];
  }
  return filter;
}

export async function listEvents(req, res) {
  const query = req.valid.query;
  const { sort, page, limit, when } = query;
  const filter = buildFilter(query);

  const sortBy = {
    date: when === 'past' ? { startDate: -1 } : { startDate: 1 },
    popular: { registeredCount: -1, startDate: 1 },
    newest: { createdAt: -1 },
    price: { price: 1, startDate: 1 },
  }[sort];

  const [items, total] = await Promise.all([
    Event.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit).select(CARD_FIELDS),
    Event.countDocuments(filter),
  ]);

  setPublicCache(res);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)), hasMore: page * limit < total });
}

export async function getMeta(_req, res) {
  const now = new Date();
  const [categories, totals, cities] = await Promise.all([
    Event.aggregate([
      { $match: { status: 'published', endDate: { $gte: now } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Event.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          events: { $sum: 1 },
          upcoming: { $sum: { $cond: [{ $gte: ['$endDate', now] }, 1, 0] } },
          attendees: { $sum: '$registeredCount' },
          ratingTotal: { $sum: '$ratingTotal' },
          ratingCount: { $sum: '$ratingCount' },
        },
      },
    ]),
    Event.distinct('venue.city', { status: 'published' }),
  ]);

  const { _id, ratingTotal = 0, ratingCount = 0, ...counts } = totals[0] ?? {};
  const rating = ratingCount ? Math.round((ratingTotal / ratingCount) * 10) / 10 : null;
  setPublicCache(res, 60);
  res.json({
    categories,
    cities,
    stats: { events: 0, upcoming: 0, attendees: 0, ...counts, cities: cities.length, rating, ratingCount },
  });
}

export async function getEvent(req, res) {
  const event = await Event.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { views: 1 } },
    { returnDocument: 'after' },
  );
  if (!event) throw new HttpError(404, 'Event not found');

  const related = await Event.find({
    _id: { $ne: event._id },
    category: event.category,
    status: 'published',
    endDate: { $gte: new Date() },
  })
    .sort({ startDate: 1 })
    .limit(3)
    .select(CARD_FIELDS);

  setPublicCache(res, 10);
  res.json({ event, related });
}

export async function createEvent(req, res) {
  const data = req.valid.body;
  let slug = slugify(data.title);
  if (await Event.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const event = await Event.create({
    ...data,
    slug,
    featured: false,
    organizer: { name: req.user.name, email: req.user.email },
    host: req.user._id,
    faqs: [
      { q: 'How do I get my ticket?', a: 'Register on Summit and your QR ticket appears instantly under My Tickets.' },
      { q: 'Can I cancel?', a: 'Yes — cancel any time from My Tickets and your seat is released for someone else.' },
    ],
  });
  res.status(201).json({ event });
}

export async function listHostedEvents(req, res) {
  const events = await Event.find({ host: req.user._id }).sort({ startDate: 1 }).select(`${CARD_FIELDS} views createdAt`);
  res.json({ items: events });
}

export async function listAttendees(req, res) {
  const event = await Event.findOne({ _id: req.params.id, host: req.user._id });
  if (!event) throw new HttpError(404, 'Event not found or you are not its host');
  const attendees = await Registration.find({ event: event._id, status: 'confirmed' })
    .sort({ createdAt: -1 })
    .select('name email organization tickets ticketCode createdAt');
  res.json({ items: attendees });
}
