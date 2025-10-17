import express from "express";
import Leaderboard from "../models/Leaderboard.js";

const router = express.Router();

// GET /api/leaderboard/global - Top 100 global leaderboard
router.get("/global", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({})
      .sort({ totalXP: -1 })
      .limit(100)
      .select("username totalXP totalINX totalGamesPlayed level");
    res.json(leaderboard);
  } catch (err) {
    console.error("Global leaderboard error:", err);
    res.status(500).json({ error: "Server error fetching global leaderboard" });
  }
});

// GET /api/leaderboard/game/:gameName - Top scores for specific game
router.get("/game/:gameName", async (req, res) => {
  try {
    const { gameName } = req.params;
    const validGames = ["wordle", "hangman", "whackAMole", "wouldYouRather", "ticTacToe", "game2048", "higherOrLower", "guessTheFlag", "whoAmI", "crossword", "tetris", "snake"];
    if (!validGames.includes(gameName)) {
      return res.status(400).json({ error: "Invalid game name" });
    }

    const leaderboard = await Leaderboard.find({})
      .sort({ [`gameHighscores.${gameName}`]: -1 })
      .limit(100)
      .select(`username gameHighscores.${gameName} totalXP`);
    res.json(leaderboard);
  } catch (err) {
    console.error("Game leaderboard error:", err);
    res.status(500).json({ error: "Server error fetching game leaderboard" });
  }
});

// GET /api/leaderboard/weekly-rewards/:gameName - Weekly rewards for top users
router.get("/weekly-rewards/:gameName", async (req, res) => {
  try {
    const { gameName } = req.params;
    const validGames = ["wordle", "hangman", "whackAMole", "wouldYouRather", "ticTacToe", "game2048", "higherOrLower", "guessTheFlag", "whoAmI", "crossword", "tetris", "snake"];
    if (!validGames.includes(gameName)) {
      return res.status(400).json({ error: "Invalid game name" });
    }

    // Get top 10 users for this game this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyTopUsers = await Leaderboard.find({
      updatedAt: { $gte: oneWeekAgo }
    })
      .sort({ [`gameHighscores.${gameName}`]: -1 })
      .limit(10)
      .select("username gameHighscores userId");

    // Define rewards for top positions
    const rewards = [
      { position: 1, inx: 500, xp: 100 },
      { position: 2, inx: 300, xp: 75 },
      { position: 3, inx: 200, xp: 50 },
      { position: 4, inx: 150, xp: 40 },
      { position: 5, inx: 100, xp: 30 },
      { position: 6, inx: 75, xp: 25 },
      { position: 7, inx: 50, xp: 20 },
      { position: 8, inx: 25, xp: 15 },
      { position: 9, inx: 15, xp: 10 },
      { position: 10, inx: 10, xp: 5 },
    ];

    const weeklyRewards = weeklyTopUsers.map((user, index) => ({
      position: index + 1,
      username: user.username,
      userId: user.userId,
      score: user.gameHighscores[gameName],
      reward: rewards[index]
    }));

    res.json({ gameName, weeklyRewards });
  } catch (err) {
    console.error("Weekly rewards error:", err);
    res.status(500).json({ error: "Server error fetching weekly rewards" });
  }
});

// POST /api/leaderboard/update - Update user leaderboard (called after game completion)
router.post("/update", async (req, res) => {
  try {
    const { userId, username, gameName, score, xpGained, inxGained } = req.body;

    let leaderboard = await Leaderboard.findOne({ userId });

    if (!leaderboard) {
      leaderboard = new Leaderboard({
        userId,
        username,
        totalGamesPlayed: 1,
        totalXP: xpGained,
        totalINX: inxGained,
        gameHighscores: { [gameName]: score },
      });
    } else {
      leaderboard.totalGamesPlayed += 1;
      leaderboard.totalXP += xpGained;
      leaderboard.totalINX += inxGained;
      leaderboard.level = Math.floor(leaderboard.totalXP / 100) + 1; // Simple level calculation
      if (score > leaderboard.gameHighscores[gameName]) {
        leaderboard.gameHighscores[gameName] = score;
      }
      leaderboard.updatedAt = new Date();
    }

    await leaderboard.save();
    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error("Update leaderboard error:", err);
    res.status(500).json({ error: "Server error updating leaderboard" });
  }
});

// GET /api/leaderboard/user/:userId - Get user's leaderboard data
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const leaderboard = await Leaderboard.findOne({ userId });
    if (!leaderboard) {
      return res.json({
        totalGamesPlayed: 0,
        totalXP: 0,
        totalINX: 0,
        level: 1,
        gameHighscores: {},
      });
    }
    res.json(leaderboard);
  } catch (err) {
    console.error("User leaderboard error:", err);
    res.status(500).json({ error: "Server error fetching user leaderboard" });
  }
});

export default router;