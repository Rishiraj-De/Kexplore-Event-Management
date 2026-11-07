import mongoose from 'mongoose';

const { Schema } = mongoose;

/** One star rating (1–5) per signed-in user per event. Event keeps the running totals. */
const ratingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true },
);

ratingSchema.index({ user: 1, event: 1 }, { unique: true });

export const Rating = mongoose.model('Rating', ratingSchema);
