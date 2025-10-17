import express from "express";
import jwt from "jsonwebtoken";
import { Achievement, UserAchievement } from "../models/Achievement.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// GET /api/achievements - Get all achievements
router.get("/", async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true });
    res.json(achievements);
  } catch (err) {
    console.error("Get achievements error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/achievements/user - Get user's achievements progress
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userAchievements = await UserAchievement.find({ userId: req.user.id })
      .populate("achievementId")
      .sort({ completedAt: -1 });

    res.json(userAchievements);
  } catch (err) {
    console.error("Get user achievements error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/achievements/check - Check and update achievement progress
router.post("/check", authMiddleware, async (req, res) => {
  try {
    const { type, data } = req.body; // type: "gamePlayed", "xpEarned", etc., data: relevant info

    const achievements = await Achievement.find({ isActive: true });
    const updates = [];

    for (const achievement of achievements) {
      let progress = 0;
      let shouldUpdate = false;

      switch (type) {
        case "gamePlayed":
          if (achievement.requirement.gamesPlayed > 0) {
            // Assume data.gamesPlayed is total games played
            progress = data.gamesPlayed;
            shouldUpdate = true;
          }
          break;
        case "xpEarned":
          if (achievement.requirement.xpEarned > 0) {
            progress = data.totalXP;
            shouldUpdate = true;
          }
          break;
        case "inxEarned":
          if (achievement.requirement.inxEarned > 0) {
            progress = data.totalINX;
            shouldUpdate = true;
          }
          break;
        case "specificGame":
          if (achievement.requirement.specificGame === data.gameName) {
            progress = data.score || 1;
            shouldUpdate = true;
          }
          break;
      }

      if (shouldUpdate) {
        let userAchievement = await UserAchievement.findOne({
          userId: req.user.id,
          achievementId: achievement._id,
        });

        if (!userAchievement) {
          userAchievement = new UserAchievement({
            userId: req.user.id,
            achievementId: achievement._id,
            progress: progress,
          });
        } else if (progress > userAchievement.progress) {
          userAchievement.progress = progress;
        }

        if (!userAchievement.isCompleted && userAchievement.progress >= achievement.requirement[type.replace("Earned", "").toLowerCase()] || userAchievement.progress >= achievement.requirement[type]) {
          userAchievement.isCompleted = true;
          userAchievement.completedAt = new Date();
        }

        await userAchievement.save();
        updates.push(userAchievement);
      }
    }

    res.json({ updates });
  } catch (err) {
    console.error("Check achievements error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/achievements/claim - Claim achievement reward
router.post("/claim", authMiddleware, async (req, res) => {
  try {
    const { achievementId } = req.body;

    const userAchievement = await UserAchievement.findOne({
      userId: req.user.id,
      achievementId,
      isCompleted: true,
      claimed: false,
    }).populate("achievementId");

    if (!userAchievement) {
      return res.status(400).json({ error: "Achievement not available for claim" });
    }

    const achievement = userAchievement.achievementId;

    // Update wallet
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (wallet) {
      wallet.inx += achievement.rewardINX;
      wallet.xp += achievement.rewardXP;
      wallet.level = Math.floor(wallet.xp / 100) + 1;
      await wallet.save();
    }

    userAchievement.claimed = true;
    userAchievement.claimedAt = new Date();
    await userAchievement.save();

    res.json({
      success: true,
      reward: { inx: achievement.rewardINX, xp: achievement.rewardXP },
      wallet: wallet,
    });
  } catch (err) {
    console.error("Claim achievement error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/achievements/seed - Seed initial achievements (admin)
router.post("/seed", async (req, res) => {
  try {
    const achievements = [
      { name: "First Game", description: "Play your first game", requirement: { gamesPlayed: 1 }, rewardINX: 10, rewardXP: 20 },
      { name: "Wordle Master", description: "Play 10 Wordle games", requirement: { specificGame: "wordle", gamesPlayed: 10 }, rewardINX: 50, rewardXP: 100 },
      { name: "Hangman Expert", description: "Play 10 Hangman games", requirement: { specificGame: "hangman", gamesPlayed: 10 }, rewardINX: 50, rewardXP: 100 },
      { name: "XP Collector", description: "Earn 500 XP", requirement: { xpEarned: 500 }, rewardINX: 100, rewardXP: 200 },
      { name: "INX Tycoon", description: "Earn 1000 INX", requirement: { inxEarned: 1000 }, rewardINX: 200, rewardXP: 300 },
    ];

    for (const ach of achievements) {
      await Achievement.findOneAndUpdate(
        { name: ach.name },
        ach,
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: "Achievements seeded" });
  } catch (err) {
    console.error("Seed achievements error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;