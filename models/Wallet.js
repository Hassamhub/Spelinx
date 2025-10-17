// backend/models/Wallet.js
import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  inx: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastCheckIn: { type: String, default: null },
});

// Add indexes for performance
WalletSchema.index({ userId: 1 }, { unique: true });
WalletSchema.index({ inx: -1 });
WalletSchema.index({ xp: -1 });

export default mongoose.model("Wallet", WalletSchema);
