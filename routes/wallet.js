// backend/routes/wallet.js
import express from "express";
import Wallet from "../models/Wallet.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// --- Auth middleware ---
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
    console.error("wallet auth error:", err && err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

// --- GET wallet ---
router.get("/", authMiddleware, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id });
      await wallet.save();
    }

    res.json(wallet);
  } catch (err) {
    console.error("GET wallet error:", err);
    res.status(500).json({ error: "Server error fetching wallet" });
  }
});

// --- POST wallet (upsert/update) ---
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { inx, xp, level, lastCheckIn, gamesPlayed, recentRewards } = req.body;

    let wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
      wallet = new Wallet({
        userId: req.user.id,
        inx: inx ?? 0,
        xp: xp ?? 0,
        level: level ?? 1,
        lastCheckIn: lastCheckIn ?? null,
        gamesPlayed: gamesPlayed ?? 0,
        recentRewards: recentRewards ?? [],
      });
    } else {
      // Update only provided fields
      if (typeof inx === "number") wallet.inx = inx;
      if (typeof xp === "number") wallet.xp = xp;
      if (typeof level === "number") wallet.level = level;
      if (lastCheckIn !== undefined) wallet.lastCheckIn = lastCheckIn ?? wallet.lastCheckIn;
      if (typeof gamesPlayed === "number") wallet.gamesPlayed = gamesPlayed;
      if (Array.isArray(recentRewards)) wallet.recentRewards = recentRewards;
    }

    await wallet.save();
    res.json(wallet);
  } catch (err) {
    console.error("POST wallet error:", err);
    res.status(500).json({ error: "Server error updating wallet" });
  }
});

// POST /api/wallet/deposit-initiate - Initiate INR to INX deposit
router.post("/deposit-initiate", authMiddleware, async (req, res) => {
  try {
    const { inrAmount } = req.body;

    if (!inrAmount || inrAmount < 10) {
      return res.status(400).json({ error: "Minimum deposit amount is ₹10" });
    }

    if (inrAmount > 10000) {
      return res.status(400).json({ error: "Maximum deposit amount is ₹10,000" });
    }

    // Calculate INX amount using configurable exchange rate
    const exchangeRate = parseFloat(process.env.INR_TO_INX_RATE) || 10;
    if (isNaN(exchangeRate) || exchangeRate <= 0) {
      return res.status(500).json({ error: "Invalid exchange rate configuration" });
    }
    const inxAmount = Math.floor(inrAmount * exchangeRate);
    const transactionId = `DEP_INR_${Date.now()}_${req.user.id}`;

    // FamPay UPI ID
    const upiId = process.env.FAMPAY_UPI_ID || "merchant@fam";

    const depositDetails = {
      transactionId,
      userId: req.user.id,
      inrAmount,
      inxAmount,
      upiId,
      qrData: `upi://pay?pa=${upiId}&am=${inrAmount}&cu=INR&tn=INX Deposit ${inxAmount} coins`,
      status: 'pending',
      createdAt: new Date(),
      notes: `Deposit ₹${inrAmount} for ${inxAmount} INX`
    };

    res.json({
      success: true,
      depositDetails,
      message: "Deposit initiated successfully. Complete payment and submit proof.",
      instructions: "1. Scan QR code or use UPI ID to pay. 2. Upload payment proof image. 3. INX will be credited after admin approval."
    });
  } catch (err) {
    console.error("Deposit initiate error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/wallet/deposit-submit-proof - Submit deposit proof
router.post("/deposit-submit-proof", authMiddleware, async (req, res) => {
  try {
    const { transactionId, proofImage, inrAmount } = req.body;

    if (!transactionId || !proofImage || !inrAmount) {
      return res.status(400).json({ error: "Transaction ID, proof image, and INR amount required" });
    }

    // Import Deposit model
    const { Deposit } = await import("../models/Transaction.js");

    // Check if deposit already exists
    const existingDeposit = await Deposit.findOne({ txnId: transactionId });
    if (existingDeposit) {
      return res.status(400).json({ error: "Deposit proof already submitted for this transaction" });
    }

    // Calculate INX amount
    const inxAmount = Math.floor(inrAmount * 10);

    // Create deposit record
    const deposit = new Deposit({
      userId: req.user.id,
      amount: inrAmount,
      txnId: transactionId,
      screenshotPath: proofImage, // In real app, save to cloud storage
      status: 'pending',
      notes: `Deposit proof submitted for ₹${inrAmount} (${inxAmount} INX)`
    });

    await deposit.save();

    console.log('Deposit proof submitted:', {
      transactionId,
      userId: req.user.id,
      inrAmount,
      inxAmount
    });

    res.json({
      success: true,
      message: "Deposit proof submitted successfully. INX will be credited after admin approval within 24 hours.",
      depositId: deposit._id,
      transactionId: deposit.txnId,
      inxAmount,
      status: 'pending',
      estimatedProcessingTime: "24 hours"
    });

  } catch (err) {
    console.error("Deposit submit proof error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
