import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { createTicketCode, HttpError } from '../utils/helpers.js';
import { CARD_FIELDS } from './events.controller.js';

const maskEmail = (email) => email.replace(/^(.{2}).*(@.*)$/, (_m, a, b) => `${a}•••${b}`);
const maskPhone = (phone) => phone.replace(/^(\+\d{2,3})\d+(\d{3})$/, (_m, a, b) => `${a} ••••• ${b}`);

const ownsRegistration = (user, reg) =>
  Boolean(user && (String(reg.user) === String(user._id) || reg.email === user.email));

/**
 * Register for an event. Runs inside a MongoDB transaction so the seat counter and the
 * registration document can never drift apart — even when two people grab the last seat at once.
 */
export async function createRegistration(req, res) {
  const { eventId, name, email, phone, organization, tickets } = req.valid.body;
  const session = await mongoose.startSession();
  let registration;

  try {
    await session.withTransaction(async () => {
      const event = await Event.findOne({ _id: eventId, status: 'published' }).session(session);
      if (!event) throw new HttpError(404, 'This event no longer exists');
      if (event.endDate < new Date()) throw new HttpError(410, 'Registrations are closed — this event has ended');

      const duplicate = await Registration.exists({ event: eventId, email, status: 'confirmed' }).session(session);
      if (duplicate) {
        throw new HttpError(409, 'You are already registered for this event', {
          email: 'This email already has a ticket for this event',
        });
      }

      const seatsLeft = event.capacity - event.registeredCount;
      const { modifiedCount } = await Event.updateOne(
        { _id: eventId, $expr: { $lte: [{ $add: ['$registeredCount', tickets] }, '$capacity'] } },
        { $inc: { registeredCount: tickets } },
        { session },
      );
      if (!modifiedCount) {
        throw new HttpError(
          409,
          seatsLeft <= 0 ? 'Sorry — this event is sold out' : `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left`,
          seatsLeft > 0 ? { tickets: `Only ${seatsLeft} left` } : undefined,
        );
      }

      [registration] = await Registration.create(
        [{ ticketCode: createTicketCode(), event: eventId, user: req.user?._id, name, email, phone, organization, tickets }],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  await registration.populate('event', CARD_FIELDS);
  res.status(201).json({ registration });
}

export async function getRegistration(req, res) {
  const registration = await Registration.findOne({ ticketCode: req.params.code.toUpperCase() }).populate(
    'event',
    CARD_FIELDS,
  );
  if (!registration) throw new HttpError(404, 'Ticket not found');

  const json = registration.toJSON();
  if (!ownsRegistration(req.user, registration)) {
    json.email = maskEmail(json.email);
    json.phone = maskPhone(json.phone);
  }
  res.json({ registration: json });
}

export async function myRegistrations(req, res) {
  const items = await Registration.find({ $or: [{ user: req.user._id }, { email: req.user.email }] })
    .sort({ createdAt: -1 })
    .populate('event', CARD_FIELDS);
  res.json({ items });
}

/** Lets a device reconcile the tickets it keeps in Local Storage with the server's truth. */
export async function syncRegistrations(req, res) {
  const { codes } = req.valid.body;
  const found = await Registration.find({ ticketCode: { $in: codes } })
    .select('ticketCode status tickets event cancelledAt')
    .populate('event', CARD_FIELDS);
  res.json({ items: found });
}

export async function cancelRegistration(req, res) {
  const code = req.params.code.toUpperCase();
  const email = req.valid.body.email;
  const session = await mongoose.startSession();
  let registration;

  try {
    await session.withTransaction(async () => {
      registration = await Registration.findOne({ ticketCode: code }).session(session);
      if (!registration) throw new HttpError(404, 'Ticket not found');
      if (!ownsRegistration(req.user, registration) && registration.email !== email) {
        throw new HttpError(403, 'Only the ticket holder can cancel this registration');
      }
      if (registration.status === 'cancelled') return;

      registration.status = 'cancelled';
      registration.cancelledAt = new Date();
      await registration.save({ session });
      await Event.updateOne(
        { _id: registration.event, registeredCount: { $gte: registration.tickets } },
        { $inc: { registeredCount: -registration.tickets } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  await registration.populate('event', CARD_FIELDS);
  res.json({ registration });
}
