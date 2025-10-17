import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["deposit", "withdraw", "game_win", "game_loss", "purchase", "reward"], required: true },
  amount: { type: Number, required: true }, // Amount in INR for deposits/withdrawals, INX for games
  currency: { type: String, enum: ["INR", "INX"], default: "INX" },
  method: { type: String, default: null }, // Payment method for deposits/withdrawals
  status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "completed" },
  transactionId: { type: String, unique: true }, // External payment provider ID
  description: { type: String, default: "" },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // Additional data
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date, default: null }
});

export default mongoose.model("Transaction", TransactionSchema);

// FamPay Deposit Model for manual verification
const DepositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true }, // Amount in INR
  txnId: { type: String, required: true }, // UPI Transaction ID
  screenshotPath: { type: String, required: true }, // Path to uploaded screenshot
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  notes: { type: String, default: "" }, // Admin notes
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Admin who verified
  verifiedAt: { type: Date, default: null },
  isTestTransfer: { type: Boolean, default: false }, // Small test transfer flag
  createdAt: { type: Date, default: Date.now }
});

// Add index for performance
DepositSchema.index({ status: 1, createdAt: -1 });
DepositSchema.index({ txnId: 1 });

// Premium Payment Proof Model
const PremiumPaymentProofSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planType: { type: String, enum: ["daily", "weekly", "monthly", "quarterly", "semiAnnual", "yearly", "lifetime"], required: true },
  amount: { type: Number, required: true }, // INX amount
  proofImage: { type: String, required: true }, // Base64 image or file path
  status: { type: String, enum: ["submitted", "approved", "rejected"], default: "submitted" },
  adminNotes: { type: String, default: "" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Admin who reviewed
  reviewedAt: { type: Date, default: null },
  submittedAt: { type: Date, default: Date.now }
});

export const PremiumPaymentProof = mongoose.model("PremiumPaymentProof", PremiumPaymentProofSchema);

export const Deposit = mongoose.model("Deposit", DepositSchema);
