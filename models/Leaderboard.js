import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  totalGamesPlayed: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  totalINX: { type: Number, default: 0 },
  gameHighscores: {
    wordle: { type: Number, default: 0 },
    hangman: { type: Number, default: 0 },
    whackAMole: { type: Number, default: 0 },
    wouldYouRather: { type: Number, default: 0 },
    ticTacToe: { type: Number, default: 0 },
    game2048: { type: Number, default: 0 },
    higherOrLower: { type: Number, default: 0 },
    guessTheFlag: { type: Number, default: 0 },
    whoAmI: { type: Number, default: 0 },
    crossword: { type: Number, default: 0 },
    tetris: { type: Number, default: 0 },
    snake: { type: Number, default: 0 },
  },
  level: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now },
});

// Add indexes for performance
LeaderboardSchema.index({ userId: 1 });
LeaderboardSchema.index({ totalXP: -1 });
LeaderboardSchema.index({ totalINX: -1 });
LeaderboardSchema.index({ level: -1 });
LeaderboardSchema.index({ updatedAt: -1 });

export default mongoose.model("Leaderboard", LeaderboardSchema);