import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import axios from "axios";
import { Deposit } from "../models/Transaction.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { verifyToken } from "./auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for deposit screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/screenshots");
    // Ensure directory exists
    require("fs").mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
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

// FamPay UPI details (configured by admin)
const FAMPAY_UPI_ID = process.env.FAMPAY_UPI_ID || "merchant@fam";

// Cryptomus Payment Gateway
const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
const CRYPTOMUS_API_KEY = process.env.CRYPTOMUS_API_KEY;
const CRYPTOMUS_WEBHOOK_SECRET = process.env.CRYPTOMUS_WEBHOOK_SECRET;
const CRYPTOMUS_API_URL = "https://api.cryptomus.com/v1";

// Helper function to generate Cryptomus signature
function generateCryptomusSignature(data, apiKey) {
  const jsonString = JSON.stringify(data);
  return crypto.createHash('md5').update(jsonString + apiKey).digest('hex');
}

// Helper function to create Cryptomus payment
async function createCryptomusPayment(amount, currency = 'USD', orderId, userId) {
  try {
    const paymentData = {
      amount: amount.toString(),
      currency,
      order_id: orderId,
      url_return: `${process.env.FRONTEND_URL}/wallet`,
      url_callback: `${process.env.BACKEND_URL}/api/payment/cryptomus-webhook`,
      is_payment_multiple: false,
      lifetime: 3600, // 1 hour
      to_currency: null
    };

    const signature = generateCryptomusSignature(paymentData, CRYPTOMUS_API_KEY);

    const response = await axios.post(`${CRYPTOMUS_API_URL}/payment`, paymentData, {
      headers: {
        'merchant': CRYPTOMUS_MERCHANT_ID,
        'sign': signature,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Cryptomus payment creation error:', error.response?.data || error.message);
    throw error;
  }
}

// Submit FamPay deposit for manual verification
router.post("/submit-deposit", verifyToken, upload.single("screenshot"), async (req, res) => {
  try {
    console.log("Deposit submission attempt by user:", req.user.id);
    const { amount, txnId, isTestTransfer = false } = req.body;

    if (!amount || amount < 10) {
      console.log("Invalid amount:", amount);
      return res.status(400).json({ error: "Minimum deposit amount is ₹10" });
    }

    if (!txnId || txnId.trim().length < 5) {
      return res.status(400).json({ error: "Valid UPI Transaction ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Payment screenshot is required" });
    }

    // Check for duplicate transaction ID
    const existingDeposit = await Deposit.findOne({
      txnId: txnId.trim(),
      status: { $ne: "rejected" }
    });

    if (existingDeposit) {
      return res.status(400).json({ error: "Transaction ID already exists" });
    }

    // Check rate limit (max 3 pending deposits per user)
    const pendingDeposits = await Deposit.countDocuments({
      userId: req.user.id,
      status: "pending"
    });

    if (pendingDeposits >= 3) {
      return res.status(400).json({ error: "Maximum 3 pending deposits allowed per user" });
    }

    // Check if user has already used first-time bonus offer
    const approvedDeposits = await Deposit.countDocuments({
      userId: req.user.id,
      status: "approved"
    });

    // Extract package name from request to check if it's a bonus package
    const { packageName = "" } = req.body;
    const isBonusPackage = packageName.toLowerCase().includes("bonus") ||
                          packageName.toLowerCase().includes("first-time") ||
                          packageName.includes("Pro Pack") ||
                          packageName.includes("Hunter Pack") ||
                          packageName.includes("Mega Pack") ||
                          packageName.includes("Elite Pack");

    if (approvedDeposits > 0 && isBonusPackage) {
      return res.status(400).json({
        error: "First-Time Buy Bonus Offer is valid only for your first purchase. This offer is not available for subsequent purchases."
      });
    }

    // Create deposit record
    const deposit = new Deposit({
      userId: req.user.id,
      amount: parseFloat(amount),
      txnId: txnId.trim(),
      screenshotPath: req.file.path,
      isTestTransfer: isTestTransfer === "true" || isTestTransfer === true,
      status: "pending"
    });

    await deposit.save();

    // Flag high-value deposits for priority review
    if (amount >= 1000) {
      // Could send notification to admin here
      console.log(`High-value deposit alert: ₹${amount} from user ${req.user.id}`);
    }

    res.json({
      success: true,
      message: "Deposit submitted successfully. It will be verified within 24 hours.",
      deposit: {
        id: deposit._id,
        amount: deposit.amount,
        txnId: deposit.txnId,
        status: deposit.status,
        createdAt: deposit.createdAt
      }
    });
  } catch (error) {
    console.error("Deposit submission error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's deposits
router.get("/my-deposits", verifyToken, async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-screenshotPath"); // Don't send file paths to frontend

    res.json({ deposits });
  } catch (error) {
    console.error("Get user deposits error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get FamPay UPI details
router.get("/fampay-details", (req, res) => {
  res.json({
    upiId: FAMPAY_UPI_ID,
    merchantName: "SPELINX Gaming",
    instructions: "Send money to the above UPI ID, then submit the transaction details below."
  });
});

// Create Cryptomus payment
router.post("/create-crypto-payment", verifyToken, async (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: "Minimum payment amount is $1" });
    }

    // Convert to INR for internal tracking (approximately $1 = ₹83)
    const inrAmount = Math.round(amount * 83);

    // Generate unique order ID
    const orderId = `CRYPTO_${req.user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record in pending state
    const transaction = new Transaction({
      userId: req.user.id,
      type: "deposit",
      amount: inrAmount,
      currency: "INR",
      method: "cryptomus",
      status: "pending",
      transactionId: orderId,
      description: `Crypto deposit: ${amount} ${currency}`,
      metadata: {
        crypto_amount: amount,
        crypto_currency: currency,
        order_id: orderId
      }
    });

    await transaction.save();

    // Create Cryptomus payment
    const paymentResponse = await createCryptomusPayment(amount, currency, orderId, req.user.id);

    if (paymentResponse.result === 'success') {
      res.json({
        success: true,
        payment: {
          id: transaction._id,
          amount: inrAmount,
          crypto_amount: amount,
          currency: currency,
          payment_url: paymentResponse.result.payment_url,
          payment_id: paymentResponse.result.payment_id,
          order_id: orderId
        }
      });
    } else {
      // Update transaction status to failed
      await Transaction.findByIdAndUpdate(transaction._id, { status: 'failed' });
      res.status(400).json({ error: "Failed to create payment" });
    }
  } catch (error) {
    console.error("Create crypto payment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Manual withdrawal request (for admin processing)
router.post("/request-withdrawal", verifyToken, async (req, res) => {
  try {
    const { amount, upiId } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Minimum withdrawal amount is ₹100" });
    }

    if (!upiId || !upiId.includes("@")) {
      return res.status(400).json({ error: "Valid UPI ID is required" });
    }

    // Check user balance
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Check for pending withdrawal
    const pendingWithdrawal = await Transaction.findOne({
      userId: req.user.id,
      type: "withdraw",
      status: "pending"
    });

    if (pendingWithdrawal) {
      return res.status(400).json({ error: "You already have a pending withdrawal request" });
    }

    // Create withdrawal transaction
    const transaction = new Transaction({
      userId: req.user.id,
      type: "withdraw",
      amount: parseFloat(amount),
      currency: "INR",
      method: "UPI",
      status: "pending",
      transactionId: `WIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: `Withdrawal to UPI: ${upiId}`,
      metadata: { upiId }
    });

    await transaction.save();

    res.json({
      success: true,
      message: "Withdrawal request submitted. It will be processed within 24-48 hours.",
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get transaction history
router.get("/transactions", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;

    const query = { userId: req.user.id };
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cryptomus webhook handler
router.post("/cryptomus-webhook", async (req, res) => {
  try {
    const webhookData = req.body;

    // Verify webhook signature
    const receivedSign = req.headers['sign'];
    if (!receivedSign) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const jsonString = JSON.stringify(webhookData);
    const expectedSign = crypto.createHash('md5').update(jsonString + CRYPTOMUS_WEBHOOK_SECRET).digest('hex');

    if (receivedSign !== expectedSign) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Process webhook data
    const { order_id, status, amount, currency, payment_amount, payment_currency } = webhookData;

    if (status !== 'paid') {
      return res.json({ status: 'ok' }); // Acknowledge but don't process non-paid statuses
    }

    // Find the transaction by order_id
    const transaction = await Transaction.findOne({
      transactionId: order_id,
      status: 'pending',
      method: 'cryptomus'
    });

    if (!transaction) {
      console.log(`Transaction not found for order_id: ${order_id}`);
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.processedAt = new Date();
    transaction.metadata = {
      ...transaction.metadata,
      payment_amount,
      payment_currency,
      webhook_received: true
    };
    await transaction.save();

    // Update user wallet
    const wallet = await Wallet.findOne({ userId: transaction.userId });
    if (wallet) {
      wallet.balance += transaction.amount;
      await wallet.save();
    } else {
      // Create wallet if doesn't exist
      const newWallet = new Wallet({
        userId: transaction.userId,
        balance: transaction.amount
      });
      await newWallet.save();
    }

    console.log(`Cryptomus payment processed: ${order_id} - ₹${transaction.amount}`);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error("Cryptomus webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
