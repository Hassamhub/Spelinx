// backend/models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "auto"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
