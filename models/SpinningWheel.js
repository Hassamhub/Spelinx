import mongoose from "mongoose";

const SpinningWheelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  lastSpinDate: { type: String, default: null }, // YYYY-MM-DD format
  totalSpins: { type: Number, default: 0 },
  spinHistory: [{
    date: { type: String, required: true },
    reward: { type: String, required: true },
    inxAmount: { type: Number, default: 0 },
    xpAmount: { type: Number, default: 0 },
  }],
});

export default mongoose.model("SpinningWheel", SpinningWheelSchema);