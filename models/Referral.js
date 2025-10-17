import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  referralCode: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  rewardClaimed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
});

export default mongoose.model("Referral", ReferralSchema);