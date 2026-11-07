import { Event } from '../models/Event.js';
import { Rating } from '../models/Rating.js';
import { HttpError } from '../utils/helpers.js';
import { CARD_FIELDS } from './events.controller.js';

export async function listBookmarks(req, res) {
  await req.user.populate({ path: 'bookmarks', select: CARD_FIELDS, match: { status: 'published' } });
  res.json({ items: req.user.bookmarks });
}

export async function toggleBookmark(req, res) {
  const { eventId } = req.params;
  if (!(await Event.exists({ _id: eventId }))) throw new HttpError(404, 'Event not found');

  const has = req.user.bookmarks.some((id) => String(id) === eventId);
  if (has) req.user.bookmarks.pull(eventId);
  else req.user.bookmarks.addToSet(eventId);
  await req.user.save();

  // Public wishlist counter shown on the heart button (never below zero).
  const event = has
    ? await Event.findOneAndUpdate({ _id: eventId, savesCount: { $gt: 0 } }, { $inc: { savesCount: -1 } }, { returnDocument: 'after' })
    : await Event.findByIdAndUpdate(eventId, { $inc: { savesCount: 1 } }, { returnDocument: 'after' });

  res.json({ bookmarked: !has, bookmarks: req.user.bookmarks, savesCount: event?.savesCount ?? 0 });
}

/** The signed-in user's own star ratings, as `{ eventId: value }`. */
export async function listMyRatings(req, res) {
  const ratings = await Rating.find({ user: req.user._id }).select('event value').lean();
  res.set('Cache-Control', 'private, no-store');
  res.json({ ratings: Object.fromEntries(ratings.map((r) => [String(r.event), r.value])) });
}

/** Set (1–5) or clear (0) the signed-in user's rating for an event and keep the event's totals in step. */
export async function rateEvent(req, res) {
  const { eventId } = req.params;
  const { value } = req.valid.body;
  if (!(await Event.exists({ _id: eventId, status: 'published' }))) throw new HttpError(404, 'Event not found');

  const previous = await Rating.findOne({ user: req.user._id, event: eventId });
  const before = previous?.value ?? 0;

  if (value === 0) {
    if (previous) await previous.deleteOne();
  } else {
    await Rating.updateOne({ user: req.user._id, event: eventId }, { $set: { value } }, { upsert: true });
  }

  const inc = { ratingTotal: value - before, ratingCount: (value > 0 ? 1 : 0) - (before > 0 ? 1 : 0) };
  const event = await Event.findByIdAndUpdate(eventId, { $inc: inc }, { returnDocument: 'after' });

  res.json({ value, rating: event.rating, ratingCount: event.ratingCount });
}
