import express from "express";
import jwt from "jsonwebtoken";
import Referral from "../models/Referral.js";
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

// GET /api/referral/code - Get user's referral code
router.get("/code", authMiddleware, async (req, res) => {
  try {
    // Generate a simple referral code based on user ID
    const referralCode = `SPELINX${req.user.id.slice(-6).toUpperCase()}`;
    res.json({ referralCode });
  } catch (err) {
    console.error("Get referral code error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/referral/use - Use referral code during signup
router.post("/use", async (req, res) => {
  try {
    console.log("Referral use attempt:", { referralCode: req.body.referralCode, newUserId: req.body.newUserId });
    const { referralCode, newUserId } = req.body;

    if (!referralCode || !newUserId) {
      console.log("Missing referral code or user ID");
      return res.status(400).json({ error: "Referral code and user ID required" });
    }

    // Extract referrer ID from code - assuming SPELINX + last 6 chars of user ID uppercase
    const referrerIdPart = referralCode.replace("SPELINX", "").toLowerCase();
    console.log("Extracted referrer ID part:", referrerIdPart);

    // Find user whose ID ends with referrerIdPart (case insensitive)
    const referrerUser = await User.findOne({ _id: { $regex: new RegExp(referrerIdPart + '$', 'i') } });
    console.log("Found referrer user:", referrerUser ? referrerUser._id : null);

    if (!referrerUser) {
      console.log("Referrer user not found for code:", referralCode);
      return res.status(400).json({ error: "Invalid referral code" });
    }

    const referrerId = referrerUser._id.toString();
    console.log("Using referrer ID:", referrerId);

    // Create referral record
    const referral = new Referral({
      referrerId,
      referredId: newUserId,
      referralCode,
      status: "completed", // Complete immediately for demo
      completedAt: new Date(),
    });

    await referral.save();

    // Reward referrer
    const referrerWallet = await Wallet.findOne({ userId: referrerId });
    if (referrerWallet) {
      referrerWallet.inx += 100; // 100 INX reward
      await referrerWallet.save();
    }

    // Reward new user
    const newUserWallet = await Wallet.findOne({ userId: newUserId });
    if (newUserWallet) {
      newUserWallet.inx += 50; // 50 INX bonus
      await newUserWallet.save();
    }

    res.json({ success: true, message: "Referral applied successfully" });
  } catch (err) {
    console.error("Use referral error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/referral/stats - Get referral stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user.id });
    const completed = referrals.filter(r => r.status === "completed");

    res.json({
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      totalEarned: completed.length * 100, // 100 INX per referral
    });
  } catch (err) {
    console.error("Get referral stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;