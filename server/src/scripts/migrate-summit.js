/**
 * One-off migration for the Summit release:
 *  • backfill Event.savesCount from users' saved events
 *  • make sure the rating totals exist on every event
 *  • rename the "Kexplore Community" organiser
 * Safe to run more than once.  Usage: node src/scripts/migrate-summit.js
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';

await connectDB();

const counts = await User.aggregate([{ $unwind: '$bookmarks' }, { $group: { _id: '$bookmarks', n: { $sum: 1 } } }]);
await Event.updateMany({}, { $set: { savesCount: 0 } });
if (counts.length) await Event.bulkWrite(counts.map(({ _id, n }) => ({ updateOne: { filter: { _id }, update: { $set: { savesCount: n } } } })));

const totals = await Event.updateMany({ ratingCount: { $exists: false } }, { $set: { ratingCount: 0, ratingTotal: 0 } });
const renamed = await Event.updateMany({ 'organizer.name': 'Kexplore Community' }, { $set: { 'organizer.name': 'Summit Community' } });

console.info(`savesCount backfilled for ${counts.length} event(s); rating totals added to ${totals.modifiedCount}; organiser renamed on ${renamed.modifiedCount}`);
await mongoose.disconnect();
