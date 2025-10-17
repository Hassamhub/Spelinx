import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "🏆" },
  type: { type: String, enum: ["daily", "weekly", "lifetime", "collection"], default: "lifetime" },
  requirement: {
    gamesPlayed: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    inxEarned: { type: Number, default: 0 },
    specificGame: { type: String, default: null },
    streakDays: { type: Number, default: 0 },
  },
  rewardINX: { type: Number, default: 10 },
  rewardXP: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true },
});

const UserAchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  achievementId: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement", required: true },
  progress: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date, default: null },
});

export const Achievement = mongoose.model("Achievement", AchievementSchema);
export const UserAchievement = mongoose.model("UserAchievement", UserAchievementSchema);