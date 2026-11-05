import { Event } from '../models/Event.js';
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

  res.json({ bookmarked: !has, bookmarks: req.user.bookmarks });
}
