import express from "express";
import jwt from "jsonwebtoken";
import SpinningWheel from "../models/SpinningWheel.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

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

// GET /api/spinning-wheel/status - Get spinning wheel status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if user is premium
    const user = await User.findById(req.user.id);
    if (!user || !user.isPremium) {
      return res.status(403).json({ error: "Premium membership required" });
    }

    let spinningWheel = await SpinningWheel.findOne({ userId: req.user.id });

    if (!spinningWheel) {
      spinningWheel = new SpinningWheel({ userId: req.user.id });
      await spinningWheel.save();
    }

    const canSpin = spinningWheel.lastSpinDate !== today;

    res.json({
      canSpin,
      lastSpinDate: spinningWheel.lastSpinDate,
      totalSpins: spinningWheel.totalSpins,
      spinHistory: spinningWheel.spinHistory.slice(-10), // Last 10 spins
    });
  } catch (err) {
    console.error("Get spinning wheel status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/spinning-wheel/spin - Spin the wheel
router.post("/spin", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if user is premium
    const user = await User.findById(req.user.id);
    if (!user || !user.isPremium) {
      return res.status(403).json({ error: "Premium membership required" });
    }

    let spinningWheel = await SpinningWheel.findOne({ userId: req.user.id });

    if (!spinningWheel) {
      spinningWheel = new SpinningWheel({ userId: req.user.id });
    }

    if (spinningWheel.lastSpinDate === today) {
      return res.status(400).json({ error: "Already spun today" });
    }

    // Define wheel segments with rewards
    const segments = [
      { reward: "100 INX", inx: 100, xp: 10 },
      { reward: "50 INX", inx: 50, xp: 5 },
      { reward: "200 INX", inx: 200, xp: 20 },
      { reward: "25 INX", inx: 25, xp: 2 },
      { reward: "500 INX", inx: 500, xp: 50 },
      { reward: "10 INX", inx: 10, xp: 1 },
      { reward: "150 INX", inx: 150, xp: 15 },
      { reward: "75 INX", inx: 75, xp: 7 },
      { reward: "300 INX", inx: 300, xp: 30 },
      { reward: "0 INX", inx: 0, xp: 0 }, // Try again
    ];

    // Randomly select a segment
    const selectedSegment = segments[Math.floor(Math.random() * segments.length)];

    // Update wallet
    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (wallet) {
      wallet.inx += selectedSegment.inx;
      wallet.xp += selectedSegment.xp;
      await wallet.save();
    }

    // Update spinning wheel record
    spinningWheel.lastSpinDate = today;
    spinningWheel.totalSpins += 1;
    spinningWheel.spinHistory.push({
      date: today,
      reward: selectedSegment.reward,
      inxAmount: selectedSegment.inx,
      xpAmount: selectedSegment.xp,
    });
    await spinningWheel.save();

    res.json({
      success: true,
      reward: selectedSegment.reward,
      inxEarned: selectedSegment.inx,
      xpEarned: selectedSegment.xp,
      wallet: wallet,
    });
  } catch (err) {
    console.error("Spin wheel error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;