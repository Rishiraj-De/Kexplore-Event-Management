import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true },
    avatar: String,
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.googleId;
        return ret;
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);
