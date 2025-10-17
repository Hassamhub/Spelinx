// backend/models/GameHistory.js
import mongoose from "mongoose";

const GameHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gameName: { type: String, required: true }, // e.g., "Wordle", "Hangman", "WhackAMole", "WouldYouRather"
    date: { type: Date, default: Date.now },
    result: { type: String, required: true }, // "win", "loss", "incomplete"
    attempts: { type: Number, default: 0 }, // for Wordle, number of guesses
    word: { type: String }, // for Wordle, the word played
    score: { type: Number, default: 0 }, // for WhackAMole, score
    inxEarned: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    // For Would You Rather, perhaps choice: { type: String }
    choice: { type: String }, // for Would You Rather
    category: { type: String }, // for Hangman
  },
  { timestamps: true }
);

export default mongoose.model("GameHistory", GameHistorySchema);