import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable not set");
      return res.status(500).json({ error: "Server configuration error" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// GET /api/premium/status - Get premium status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "isPremium premiumExpiresAt premiumType avatar theme banner"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    const gracePeriodDays = 7; // 7 days grace period
    const gracePeriodEnd = new Date(now);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);

    const isActive = user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > now;
    const isInGracePeriod = user.isPremium && user.premiumExpiresAt &&
                           user.premiumExpiresAt <= now && user.premiumExpiresAt > gracePeriodEnd;

    // If truly expired (beyond grace period), update status
    if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt <= gracePeriodEnd) {
      user.isPremium = false;
      await user.save();
    }

    res.json({
      isPremium: isActive,
      premiumExpiresAt: user.premiumExpiresAt,
      premiumType: user.premiumType,
      avatar: user.avatar,
      theme: user.theme,
      banner: user.banner,
    });
  } catch (err) {
    console.error("Get premium status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/premium/initiate-payment - Initiate premium payment (UPI QR + Manual verification)
router.post("/initiate-payment", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // 'daily', 'weekly', 'monthly', 'quarterly', 'semiAnnual', 'yearly', 'lifetime'
    console.log('Payment initiation request:', { type, userId: req.user.id });

    // Validate type parameter - expanded options
    const validTypes = ['monthly', 'quarterly', 'semiAnnual', 'yearly', 'lifetime'];
    if (!type || !validTypes.includes(type)) {
      console.log('Invalid premium type:', type);
      return res.status(400).json({
        error: `Invalid premium type. Available types are: ${validTypes.join(', ')}`,
        validTypes
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Pricing - Updated with more plan options
    const pricing = {
      monthly: { cost: 499, name: "Monthly Plan" },
      quarterly: { cost: 1200, name: "Quarterly Plan" },
      semiAnnual: { cost: 2200, name: "Semi-Annual Plan" },
      yearly: { cost: 3999, name: "Yearly Plan" },
      lifetime: { cost: 10000, name: "Lifetime Plan" }
    };

    const selectedPlan = pricing[type];

    // Generate unique transaction ID
    const transactionId = `PREMIUM_${Date.now()}_${req.user.id}_${type}`;

    // FamPay UPI ID from environment
    const upiId = process.env.FAMPAY_UPI_ID || "merchant@fam";
    const merchantName = process.env.MERCHANT_NAME || "SPELINX Gaming";

    // Create proper UPI URI for mobile app integration
    // Use standard upi:// scheme that works across all platforms
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${selectedPlan.cost}&cu=INR&tn=${encodeURIComponent(`${selectedPlan.name} - SPELINX Premium`)}`;

    // Create payment details for manual processing
    const paymentDetails = {
      transactionId,
      userId: req.user.id,
      type,
      amount: selectedPlan.cost,
      upiId,
      merchantName,
      qrData: upiUri, // Full UPI URI for QR code
      planName: selectedPlan.name,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date(),
      notes: `Premium ${selectedPlan.name} payment - ₹${selectedPlan.cost}`
    };

    res.json({
      success: true,
      paymentDetails,
      message: "Payment initiated successfully. Please complete the UPI transaction and upload proof.",
      instructions: "1. Scan QR code or use UPI ID to pay. 2. Upload payment proof image. 3. Wait for admin approval. 4. INX will be credited to your wallet."
    });
  } catch (err) {
    console.error("Initiate payment error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/premium/submit-proof - Submit payment proof for verification
router.post("/submit-proof", authMiddleware, async (req, res) => {
  try {
    const { transactionId, proofImage, planType } = req.body; // proofImage should be base64 or file upload

    if (!transactionId || !proofImage || !planType) {
      return res.status(400).json({ error: "Transaction ID, proof image, and plan type required" });
    }

    // Import the PremiumPaymentProof model
    const { PremiumPaymentProof } = await import("../models/Transaction.js");

    // Check if proof already exists
    const existingProof = await PremiumPaymentProof.findOne({ transactionId });
    if (existingProof) {
      return res.status(400).json({ error: "Payment proof already submitted for this transaction" });
    }

    // Get plan pricing
    const pricing = {
      daily: { cost: 50, name: "Daily Trial" },
      weekly: { cost: 200, name: "Weekly Plan" },
      monthly: { cost: 500, name: "Monthly Plan" },
      quarterly: { cost: 1200, name: "Quarterly Plan" },
      semiAnnual: { cost: 2200, name: "Semi-Annual Plan" },
      yearly: { cost: 4000, name: "Yearly Plan" },
      lifetime: { cost: 10000, name: "Lifetime Plan" }
    };

    const selectedPlan = pricing[planType];
    if (!selectedPlan) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    // Create payment proof record
    const paymentProof = new PremiumPaymentProof({
      transactionId,
      userId: req.user.id,
      planType,
      amount: selectedPlan.cost,
      proofImage, // In real app, this would be saved to cloud storage
      status: 'submitted',
      submittedAt: new Date()
    });

    await paymentProof.save();

    console.log('Payment proof submitted:', {
      transactionId,
      userId: req.user.id,
      planType,
      amount: selectedPlan.cost
    });

    res.json({
      success: true,
      message: "Payment proof submitted successfully. Admin will verify and process your premium activation within 24 hours.",
      proofId: paymentProof._id,
      transactionId: paymentProof.transactionId,
      status: 'submitted',
      estimatedProcessingTime: "24 hours"
    });

  } catch (err) {
    console.error("Submit proof error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// REMOVE legacy purchase endpoint - now using payment proof system only

// POST /api/premium/customize - Update user customizations
router.post("/customize", authMiddleware, async (req, res) => {
  try {
    const { avatar, theme, banner } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update customizations
    if (avatar !== undefined) user.avatar = avatar;
    if (theme !== undefined) user.theme = theme;
    if (banner !== undefined) user.banner = banner;

    await user.save();

    res.json({
      success: true,
      message: "Customizations updated successfully",
      avatar: user.avatar,
      theme: user.theme,
      banner: user.banner,
    });
  } catch (err) {
    console.error("Customize error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/premium/features - Get available premium features
router.get("/features", (req, res) => {
  res.json({
    features: [
      "No advertisements",
      "2x INX rewards from games",
      "Early access to new games",
      "Exclusive premium skins and themes",
      "Priority support",
      "Advanced statistics",
      "Custom avatars and banners",
      "Daily spinning wheel",
      "Weekly leaderboard bonuses",
      "VIP Discord access",
      "Monthly exclusive tournaments",
      "Premium game modes",
      "Custom profile themes",
      "Achievement showcase",
      "Real-time notifications"
    ],
    pricing: {
      daily: { cost: 50, days: 1, name: "Daily Trial" },
      weekly: { cost: 200, days: 7, name: "Weekly Plan" },
      monthly: { cost: 500, days: 30, name: "Monthly Plan" },
      quarterly: { cost: 1200, days: 90, name: "Quarterly Plan", savings: "10% off" },
      semiAnnual: { cost: 2200, days: 180, name: "Semi-Annual Plan", savings: "15% off" },
      yearly: { cost: 4000, days: 365, name: "Yearly Plan", savings: "20% off" },
      lifetime: { cost: 10000, days: 3650, name: "Lifetime Plan", savings: "60% off" }
    }
  });
});

export default router;