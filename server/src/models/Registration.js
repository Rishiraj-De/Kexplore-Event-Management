import mongoose from 'mongoose';
import { MAX_TICKETS_PER_REGISTRATION } from '../utils/constants.js';

const { Schema } = mongoose;

const registrationSchema = new Schema(
  {
    ticketCode: { type: String, required: true, unique: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    organization: { type: String, trim: true },
    tickets: { type: Number, default: 1, min: 1, max: MAX_TICKETS_PER_REGISTRATION },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

// One active registration per email per event — enforced by the database, not just the UI.
registrationSchema.index(
  { event: 1, email: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' }, name: 'one_active_registration_per_email' },
);
registrationSchema.index({ user: 1, createdAt: -1 });
registrationSchema.index({ email: 1 });

export const Registration = mongoose.model('Registration', registrationSchema);
