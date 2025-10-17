import mongoose from "mongoose";

const DailyClaimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  lastClaimDate: { type: String, default: null }, // YYYY-MM-DD format
  streak: { type: Number, default: 0 },
  totalClaims: { type: Number, default: 0 },
});

export default mongoose.model("DailyClaim", DailyClaimSchema);