import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // A person signs in with Google, with an email + password, or both (same email → same account).
    googleId: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, select: false },
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
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);
