import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, GameHistory } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from header (optional for games listing)
    const token = request.headers.get('authorization')?.split(' ')[1];
    let decoded = null;

    if (token) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;
      } catch (error) {
        // Token invalid, but continue without user data
      }
    }

    // Define available games
    const games = [
      {
        id: '2048',
        name: '2048',
        description: 'Combine tiles to reach 2048! A classic puzzle game.',
        category: 'puzzle',
        difficulty: 'medium',
        maxScore: null,
        estimatedTime: '5-15 min',
        image: '/games/2048-icon.png',
        route: '/games/2048',
        isActive: true,
        features: ['Score tracking', 'Mobile friendly', 'No time limit']
      },
      {
        id: 'snake',
        name: 'Snake Game',
        description: 'Classic snake game - eat food, grow longer, avoid walls!',
        category: 'arcade',
        difficulty: 'easy',
        maxScore: null,
        estimatedTime: '3-10 min',
        image: '/games/snake-icon.png',
        route: '/games/snake',
        isActive: true,
        features: ['Multiple difficulty levels', 'Mobile friendly', 'Progressive speed']
      },
      {
        id: 'tetris',
        name: 'Tetris',
        description: 'Arrange falling blocks to create complete rows!',
        category: 'puzzle',
        difficulty: 'hard',
        maxScore: null,
        estimatedTime: '5-20 min',
        image: '/games/tetris-icon.png',
        route: '/games/tetris',
        isActive: true,
        features: ['7 different pieces', 'Progressive difficulty', 'Line clearing']
      },
      {
        id: 'crossword',
        name: 'Crossword',
        description: 'Solve challenging crossword puzzles!',
        category: 'word',
        difficulty: 'medium',
        maxScore: 1000,
        estimatedTime: '10-30 min',
        image: '/games/crossword-icon.png',
        route: '/games/crossword',
        isActive: true,
        features: ['Multiple difficulty levels', 'Hints available', 'Score system']
      },
      {
        id: 'guesstheflag',
        name: 'Guess the Flag',
        description: 'Test your geography knowledge!',
        category: 'trivia',
        difficulty: 'easy',
        maxScore: 1000,
        estimatedTime: '5-15 min',
        image: '/games/guesstheflag-icon.png',
        route: '/games/guesstheflag',
        isActive: true,
        features: ['Country flags', 'Multiple choice', 'Score tracking']
      },
      {
        id: 'tictactoe',
        name: 'Tic Tac Toe',
        description: 'Classic 3x3 grid game against AI!',
        category: 'strategy',
        difficulty: 'easy',
        maxScore: 100,
        estimatedTime: '2-5 min',
        image: '/games/tictactoe-icon.png',
        route: '/games/tictactoe',
        isActive: true,
        features: ['AI opponent', 'Quick games', 'Score tracking']
      }
    ];

    // Get user stats if authenticated
    let userStats = {};
    if (decoded) {
      const userGameHistory = await GameHistory.find({ userId: decoded.id })
        .sort({ createdAt: -1 })
        .limit(10);

      const totalGames = await GameHistory.countDocuments({ userId: decoded.id });
      const completedGames = await GameHistory.countDocuments({
        userId: decoded.id,
        completed: true
      });

      userStats = {
        totalGamesPlayed: totalGames,
        completedGames,
        recentGames: userGameHistory.map(game => ({
          gameType: game.gameType,
          score: game.score,
          completed: game.completed,
          rewardEarned: game.rewardEarned,
          createdAt: game.createdAt
        }))
      };
    }

    return NextResponse.json({
      success: true,
      games: games.filter(game => game.isActive),
      userStats,
      totalGames: games.filter(game => game.isActive).length,
      categories: Array.from(new Set(games.map(game => game.category)))
    });

  } catch (error: any) {
    console.error('Games API error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}