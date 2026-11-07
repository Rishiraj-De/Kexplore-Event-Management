import mongoose from 'mongoose';
import { CATEGORIES, EVENT_MODES } from '../utils/constants.js';

const { Schema } = mongoose;

const speakerSchema = new Schema(
  { name: { type: String, required: true }, role: String, avatar: String },
  { _id: false },
);

const agendaSchema = new Schema(
  { time: { type: String, required: true }, title: { type: String, required: true }, description: String },
  { _id: false },
);

const faqSchema = new Schema({ q: { type: String, required: true }, a: { type: String, required: true } }, { _id: false });

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, trim: true, maxlength: 160 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 240 },
    description: { type: String, required: true, maxlength: 6000 },
    category: { type: String, enum: CATEGORIES, required: true },
    tags: { type: [String], default: [] },
    coverImage: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    mode: { type: String, enum: EVENT_MODES, default: 'offline' },
    venue: {
      name: { type: String, required: true },
      address: String,
      city: { type: String, required: true },
      lat: Number,
      lng: Number,
    },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    organizer: {
      name: { type: String, required: true },
      email: String,
      website: String,
    },
    host: { type: Schema.Types.ObjectId, ref: 'User' },
    speakers: { type: [speakerSchema], default: [] },
    agenda: { type: [agendaSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    status: { type: String, enum: ['published', 'cancelled'], default: 'published' },
    views: { type: Number, default: 0 },
    // Running totals so cards can show ratings and wishlist counts without extra queries.
    ratingCount: { type: Number, default: 0, min: 0 },
    ratingTotal: { type: Number, default: 0, min: 0 },
    savesCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

eventSchema.virtual('seatsLeft').get(function seatsLeft() {
  return Math.max(0, this.capacity - this.registeredCount);
});

eventSchema.virtual('rating').get(function rating() {
  return this.ratingCount ? Math.round((this.ratingTotal / this.ratingCount) * 10) / 10 : null;
});

eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ featured: 1, startDate: 1 });
eventSchema.index({ host: 1 });

export const Event = mongoose.model('Event', eventSchema);
