import express from "express";
import jwt from "jsonwebtoken";
import DailyClaim from "../models/DailyClaim.js";
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

// GET /api/daily/status - Get daily claim status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let dailyClaim = await DailyClaim.findOne({ userId: req.user.id });

    if (!dailyClaim) {
      dailyClaim = new DailyClaim({ userId: req.user.id });
      await dailyClaim.save();
    }

    const canClaim = dailyClaim.lastClaimDate !== today;
    const streakBonus = dailyClaim.streak >= 7 ? 50 : 0; // Bonus for 7+ streak
    const baseReward = 25 + (dailyClaim.streak * 5); // Increasing reward

    // Premium users get double rewards
    const user = await User.findById(req.user.id);
    const multiplier = user.isPremium ? 2 : 1;
    const totalReward = (baseReward + streakBonus) * multiplier;

    res.json({
      canClaim,
      streak: dailyClaim.streak,
      totalClaims: dailyClaim.totalClaims,
      lastClaimDate: dailyClaim.lastClaimDate,
      reward: totalReward,
      bonus: streakBonus * multiplier,
      isPremium: user.isPremium,
      multiplier,
    });
  } catch (err) {
    console.error("Get daily status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/daily/claim - Claim daily reward
router.post("/claim", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    let dailyClaim = await DailyClaim.findOne({ userId: req.user.id });

    if (!dailyClaim) {
      dailyClaim = new DailyClaim({ userId: req.user.id });
    }

    if (dailyClaim.lastClaimDate === today) {
      return res.status(400).json({ error: "Already claimed today" });
    }

    // Check if claiming consecutively
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dailyClaim.lastClaimDate === yesterdayStr) {
      dailyClaim.streak += 1;
    } else {
      dailyClaim.streak = 1; // Reset streak if not consecutive
    }

    const streakBonus = dailyClaim.streak >= 7 ? 50 : 0;
    const baseReward = 25 + (dailyClaim.streak * 5);

    // Premium users get double rewards
    const user = await User.findById(req.user.id);
    const multiplier = user.isPremium ? 2 : 1;
    const totalReward = (baseReward + streakBonus) * multiplier;

    // Update wallet
    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id, inx: totalReward });
    } else {
      wallet.inx += totalReward;
    }
    await wallet.save();

    // Update daily claim
    dailyClaim.lastClaimDate = today;
    dailyClaim.totalClaims += 1;
    await dailyClaim.save();

    res.json({
      success: true,
      reward: totalReward,
      bonus: streakBonus * multiplier,
      streak: dailyClaim.streak,
      wallet: wallet,
      isPremium: user.isPremium,
      multiplier,
    });
  } catch (err) {
    console.error("Claim daily error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;