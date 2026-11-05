/**
 * Seed MongoDB with the demo catalogue.
 *   npm run seed         → upsert events by slug (keeps registrations & live seat counts)
 *   npm run seed:reset   → wipe events + registrations, then insert fresh
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { defaultFaqs, events } from '../data/events.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import { slugify } from '../utils/helpers.js';

const reset = process.argv.includes('--reset');

await connectDB();

if (reset) {
  await Promise.all([Event.deleteMany({ host: { $exists: false } }), Registration.deleteMany({})]);
  console.info('↺ Cleared seeded events and all registrations');
}

let created = 0;
let updated = 0;
for (const raw of events) {
  const slug = slugify(raw.title);
  const doc = { faqs: defaultFaqs, ...raw, slug };
  const existing = await Event.findOne({ slug });
  if (existing) {
    // Never overwrite live seat counts with seed values.
    const { registeredCount: _ignored, ...rest } = doc;
    existing.set(rest);
    await existing.save();
    updated += 1;
  } else {
    await Event.create(doc);
    created += 1;
  }
}

await Promise.all([Event.syncIndexes(), Registration.syncIndexes(), User.syncIndexes()]);
console.info(`✔ Seed complete — ${created} created, ${updated} updated, ${await Event.countDocuments()} total events`);
await mongoose.disconnect();
