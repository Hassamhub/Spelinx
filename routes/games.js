// backend/routes/games.js
import express from "express";
import GameHistory from "../models/GameHistory.js";
import User from "../models/User.js";

const router = express.Router();

// Middleware to verify JWT (assuming auth middleware exists)
import jwt from "jsonwebtoken";
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get game history for a user and game
router.get("/history/:gameName", verifyToken, async (req, res) => {
  try {
    const { gameName } = req.params;
    const history = await GameHistory.find({ userId: req.userId, gameName }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Post game result
router.post("/play", verifyToken, async (req, res) => {
  try {
    const { gameName, result, attempts, word, score, inxEarned, xpEarned, choice, category } = req.body;

    // Check if user is premium for bonus rewards
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPremium = user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > new Date();
    const multiplier = isPremium ? 2 : 1;

    const adjustedInxEarned = (inxEarned || 0) * multiplier;
    const adjustedXpEarned = (xpEarned || 0) * multiplier;

    const newHistory = new GameHistory({
      userId: req.userId,
      gameName,
      result,
      attempts,
      word,
      score,
      inxEarned: adjustedInxEarned,
      xpEarned: adjustedXpEarned,
      choice,
      category,
    });
    await newHistory.save();

    // Update user INX and XP
    user.inx += adjustedInxEarned;
    user.xp += adjustedXpEarned;
    await user.save();

    res.json({
      message: "Game recorded",
      bonusApplied: isPremium,
      multiplier,
      actualRewards: { inx: adjustedInxEarned, xp: adjustedXpEarned }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;