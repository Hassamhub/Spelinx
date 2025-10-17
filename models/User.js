// backend/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/ },

    // SPELINX Plus membership
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null },
    premiumType: { type: String, enum: ['monthly', 'yearly'], default: null },

    // Wallet fields
    inx: { type: Number, default: 100 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // User preferences and customizations
    avatar: { type: String, default: null },
    theme: { type: String, default: 'default' },
    banner: { type: String, default: null },

    // Admin fields
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    lastLogin: { type: Date, default: null },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Add indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ isPremium: 1, premiumExpiresAt: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ lastLogin: -1 });

export default mongoose.model("User", UserSchema);
