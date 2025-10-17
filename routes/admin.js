import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Deposit } from "../models/Transaction.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import GameHistory from "../models/GameHistory.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/screenshots"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "deposit-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// Get all deposits with filtering
router.get("/deposits", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      // Search by txnId or user email
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      query.$or = [
        { txnId: { $regex: search, $options: "i" } },
        { userId: { $in: users.map(u => u._id) } }
      ];
    }

    const deposits = await Deposit.find(query)
      .populate("userId", "username email")
      .populate("verifiedBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Deposit.countDocuments(query);

    res.json({
      deposits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get deposits error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Approve deposit
router.post("/deposits/:id/approve", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ error: "Deposit not found" });
    }

    if (deposit.status !== "pending") {
      return res.status(400).json({ error: "Deposit is not pending" });
    }

    // Update deposit
    deposit.status = "approved";
    deposit.verifiedBy = req.user.id;
    deposit.verifiedAt = new Date();
    if (notes) deposit.notes = notes;

    // Credit user wallet
    let wallet = await Wallet.findOne({ userId: deposit.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: deposit.userId, inx: 0 });
    }
    wallet.inx += deposit.amount; // deposit.amount is in INR, convert to INX
    await wallet.save();

    // Update user total deposited
    const user = await User.findById(deposit.userId);
    if (user) {
      user.totalDeposited = (user.totalDeposited || 0) + deposit.amount;
      await user.save();
    }

    await deposit.save();

    // Create transaction record
    const Transaction = (await import("../models/Transaction.js")).default;
    const transaction = new Transaction({
      userId: deposit.userId,
      type: "deposit",
      amount: deposit.amount,
      currency: "INR",
      method: "FamPay",
      status: "completed",
      transactionId: `DEP_${deposit._id}_${Date.now()}`,
      description: `FamPay deposit - TXN: ${deposit.txnId}`,
      processedAt: new Date()
    });
    await transaction.save();

    res.json({
      success: true,
      message: "Deposit approved successfully",
      deposit
    });
  } catch (error) {
    console.error("Approve deposit error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reject deposit
router.post("/deposits/:id/reject", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim().length < 5) {
      return res.status(400).json({ error: "Rejection reason is required (minimum 5 characters)" });
    }

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ error: "Deposit not found" });
    }

    if (deposit.status !== "pending") {
      return res.status(400).json({ error: "Deposit is not pending" });
    }

    deposit.status = "rejected";
    deposit.verifiedBy = req.user.id;
    deposit.verifiedAt = new Date();
    deposit.notes = notes;

    await deposit.save();

    res.json({
      success: true,
      message: "Deposit rejected",
      deposit
    });
  } catch (error) {
    console.error("Reject deposit error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get deposit statistics
router.get("/stats/deposits", verifyToken, isAdmin, async (req, res) => {
  try {
    const stats = await Deposit.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalDeposits = await Deposit.countDocuments();
    const pendingDeposits = await Deposit.countDocuments({ status: "pending" });
    const todayDeposits = await Deposit.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      stats,
      summary: {
        total: totalDeposits,
        pending: pendingDeposits,
        today: todayDeposits
      }
    });
  } catch (error) {
    console.error("Get deposit stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users with filtering and pagination
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, premium } = req.query;

    let query = {};

    // Search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by banned status
    if (status === "banned") {
      query.isBanned = true;
    } else if (status === "active") {
      query.isBanned = false;
    }

    // Filter by premium status
    if (premium === "true") {
      query.isPremium = true;
    } else if (premium === "false") {
      query.isPremium = false;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ban/unban user
router.post("/users/:id/ban", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ban, reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isBanned = ban;
    if (ban && reason) {
      user.banReason = reason;
    } else if (!ban) {
      user.banReason = null;
    }
    await user.save();

    res.json({
      success: true,
      message: ban ? "User banned successfully" : "User unbanned successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isBanned: user.isBanned,
        banReason: user.banReason
      }
    });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Edit user account
router.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, inx, xp, isPremium, premiumExpiresAt } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (isPremium !== undefined) user.isPremium = isPremium;
    if (premiumExpiresAt) user.premiumExpiresAt = new Date(premiumExpiresAt);

    await user.save();

    // Update wallet if needed
    if (inx !== undefined || xp !== undefined) {
      let wallet = await Wallet.findOne({ userId: id });
      if (!wallet) {
        wallet = new Wallet({ userId: id });
      }
      if (inx !== undefined) wallet.inx = inx;
      if (xp !== undefined) wallet.xp = xp;
      await wallet.save();
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error("Edit user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user statistics
router.get("/users/:id/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const wallet = await Wallet.findOne({ userId: id });
    const gameHistory = await GameHistory.find({ userId: id }).sort({ date: -1 }).limit(50);

    // Calculate statistics
    const totalGames = gameHistory.length;
    const winRate = totalGames > 0 ?
      (gameHistory.filter(g => g.result === 'win').length / totalGames * 100).toFixed(2) : 0;

    res.json({
      user,
      wallet,
      stats: {
        totalGames,
        winRate: `${winRate}%`,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
        totalDeposited: user.totalDeposited || 0
      },
      recentGames: gameHistory.slice(0, 10)
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get admin statistics for dashboard
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const recentSignups = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });

    const totalGames = await GameHistory.countDocuments();
    const totalRevenue = await Deposit.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get sales stats breakdown
    const monthlyRevenue = await Deposit.aggregate([
      { $match: { status: "approved", createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const premiumRevenue = await Deposit.aggregate([
      { $match: { type: "premium_purchase", status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Track online users (users who were active in last 5 minutes)
    const onlineUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    res.json({
      totalUsers,
      activeUsers,
      premiumUsers,
      bannedUsers,
      totalGames,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentSignups,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      premiumRevenue: premiumRevenue[0]?.total || 0,
      onlineUsers
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get system statistics
router.get("/system-stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const todayLogins = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const totalGames = await GameHistory.countDocuments();
    const todayGames = await GameHistory.countDocuments({
      date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      users: {
        total: totalUsers,
        premium: premiumUsers,
        banned: bannedUsers,
        todayLogins
      },
      games: {
        total: totalGames,
        today: todayGames
      }
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/premium-payments - Get premium payment proofs for admin review
router.get("/premium-payments", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    // Import the PremiumPaymentProof model
    const { PremiumPaymentProof } = await import("../models/Transaction.js");

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      // Search by transactionId or user email/username
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { userId: { $in: users.map(u => u._id) } }
      ];
    }

    const payments = await PremiumPaymentProof.find(query)
      .populate("userId", "username email")
      .populate("reviewedBy", "username")
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PremiumPaymentProof.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get premium payments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/premium-payments/:id/approve - Approve premium payment proof
router.post("/premium-payments/:id/approve", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Import the PremiumPaymentProof model
    const { PremiumPaymentProof } = await import("../models/Transaction.js");

    const payment = await PremiumPaymentProof.findById(id);
    if (!payment) {
      return res.status(404).json({ error: "Payment proof not found" });
    }

    if (payment.status !== "submitted") {
      return res.status(400).json({ error: "Payment proof is not in submitted status" });
    }

    // Update payment proof
    payment.status = "approved";
    payment.reviewedBy = req.user.id;
    payment.reviewedAt = new Date();
    if (notes) payment.adminNotes = notes;

    // Get plan pricing to determine days
    const pricing = {
      daily: { cost: 50, days: 1 },
      weekly: { cost: 200, days: 7 },
      monthly: { cost: 500, days: 30 },
      quarterly: { cost: 1200, days: 90 },
      semiAnnual: { cost: 2200, days: 180 },
      yearly: { cost: 4000, days: 365 },
      lifetime: { cost: 10000, days: 3650 }
    };

    const selectedPlan = pricing[payment.planType];

    // Update user premium status
    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    let expiresAt = new Date(user.premiumExpiresAt || now);

    if (user.isPremium && expiresAt > now) {
      // Extend existing premium
      expiresAt.setDate(expiresAt.getDate() + selectedPlan.days);
    } else {
      // New premium subscription
      expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + selectedPlan.days);
    }

    user.isPremium = true;
    user.premiumExpiresAt = expiresAt;
    user.premiumType = payment.planType;
    await user.save();

    // Credit INX to user's wallet (if needed for any bonuses)
    // This is optional - premium is already activated

    await payment.save();

    // Create transaction record
    const Transaction = (await import("../models/Transaction.js")).default;
    const transaction = new Transaction({
      userId: payment.userId,
      type: "premium_purchase",
      amount: payment.amount,
      currency: "INX",
      status: "completed",
      transactionId: `PREMIUM_${payment.transactionId}`,
      description: `Premium ${payment.planType} purchase approved`,
      processedAt: new Date()
    });
    await transaction.save();

    res.json({
      success: true,
      message: `Premium payment approved successfully. User ${user.username} now has ${payment.planType} premium.`,
      payment,
      user: {
        username: user.username,
        email: user.email,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        premiumType: user.premiumType
      }
    });
  } catch (error) {
    console.error("Approve premium payment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/premium-payments/:id/reject - Reject premium payment proof
router.post("/premium-payments/:id/reject", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim().length < 5) {
      return res.status(400).json({ error: "Rejection reason is required (minimum 5 characters)" });
    }

    // Import the PremiumPaymentProof model
    const { PremiumPaymentProof } = await import("../models/Transaction.js");

    const payment = await PremiumPaymentProof.findById(id);
    if (!payment) {
      return res.status(404).json({ error: "Payment proof not found" });
    }

    if (payment.status !== "submitted") {
      return res.status(400).json({ error: "Payment proof is not in submitted status" });
    }

    // Update payment proof
    payment.status = "rejected";
    payment.reviewedBy = req.user.id;
    payment.reviewedAt = new Date();
    payment.adminNotes = notes;

    await payment.save();

    res.json({
      success: true,
      message: "Premium payment proof rejected",
      payment
    });
  } catch (error) {
    console.error("Reject premium payment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Change user password (admin only)
router.post("/users/:id/change-password", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const bcrypt = await import("bcryptjs");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get sales statistics breakdown
router.get("/sales-stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range based on period
    let dateRange = new Date();
    if (period === 'week') {
      dateRange.setDate(dateRange.getDate() - 7);
    } else if (period === 'month') {
      dateRange.setMonth(dateRange.getMonth() - 1);
    } else if (period === 'year') {
      dateRange.setFullYear(dateRange.getFullYear() - 1);
    }

    // Get deposit stats
    const depositStats = await Deposit.aggregate([
      { $match: { status: "approved", createdAt: { $gte: dateRange } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Get premium subscription stats
    const premiumStats = await Deposit.aggregate([
      { $match: { type: "premium_purchase", status: "approved", createdAt: { $gte: dateRange } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Get wallet deposit stats
    const walletStats = await Deposit.aggregate([
      { $match: { status: "approved", type: { $ne: "premium_purchase" }, createdAt: { $gte: dateRange } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
          }
      },
      { $sort: { "_id": 1 } }
    ]);

    const totalRevenue = await Deposit.aggregate([
      { $match: { status: "approved", createdAt: { $gte: dateRange } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      period,
      totalRevenue: totalRevenue[0]?.total || 0,
      depositStats,
      premiumStats,
      walletStats
    });
  } catch (error) {
    console.error("Get sales stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;