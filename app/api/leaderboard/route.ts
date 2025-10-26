import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User, GameHistory } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from header (optional for leaderboard)
    const token = request.headers.get('authorization')?.split(' ')[1];
    let decoded = null;

    if (token) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;
      } catch (error) {
        // Token invalid, but continue without user data
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    const period = searchParams.get('period') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build aggregation pipeline for leaderboard
    const matchStage: any = {};

    if (game) {
      matchStage.gameType = game;
    }

    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      matchStage.createdAt = { $gte: startDate };
    }

    // Get leaderboard data
    const leaderboard = await GameHistory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          totalReward: { $sum: '$rewardEarned' },
          gamesPlayed: { $sum: 1 },
          completedGames: { $sum: { $cond: ['$completed', 1, 0] } },
          bestScore: { $max: '$score' },
          lastPlayed: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          avatar: '$user.avatar',
          level: '$user.level',
          isPremium: '$user.isPremium',
          totalScore: 1,
          totalReward: 1,
          gamesPlayed: 1,
          completedGames: 1,
          bestScore: 1,
          lastPlayed: 1
        }
      },
      { $sort: { totalScore: -1, bestScore: -1, completedGames: -1 } },
      { $limit: limit }
    ]);

    // Get user rank if authenticated
    let userRank = null;
    if (decoded) {
      const userStats = await GameHistory.aggregate([
        { $match: { userId: decoded.id, ...matchStage } },
        {
          $group: {
            _id: '$userId',
            totalScore: { $sum: '$score' }
          }
        }
      ]);

      if (userStats.length > 0) {
        const allUsersAbove = await GameHistory.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$userId',
              totalScore: { $sum: '$score' }
            }
          },
          { $sort: { totalScore: -1 } },
          {
            $group: {
              _id: null,
              users: { $push: '$$ROOT' }
            }
          },
          {
            $project: {
              rank: {
                $add: [
                  { $indexOfArray: ['$users.userId', decoded.id] },
                  1
                ]
              }
            }
          }
        ]);

        userRank = allUsersAbove.length > 0 ? allUsersAbove[0].rank : null;
      }
    }

    // Get game-specific stats
    const gameStats = await GameHistory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$gameType',
          totalPlayers: { $addToSet: '$userId' },
          totalGames: { $sum: 1 },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' }
        }
      },
      {
        $project: {
          gameType: '$_id',
          totalPlayers: { $size: '$totalPlayers' },
          totalGames: 1,
          averageScore: { $round: ['$averageScore', 2] },
          highestScore: 1
        }
      },
      { $sort: { totalGames: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.username,
        avatar: entry.avatar,
        level: entry.level || 1,
        isPremium: entry.isPremium || false,
        totalScore: entry.totalScore || 0,
        totalReward: entry.totalReward || 0,
        gamesPlayed: entry.gamesPlayed || 0,
        completedGames: entry.completedGames || 0,
        bestScore: entry.bestScore || 0,
        lastPlayed: entry.lastPlayed
      })),
      userRank,
      gameStats,
      period,
      totalPlayers: leaderboard.length,
      filters: {
        game,
        period,
        limit
      }
    });

  } catch (error: any) {
    console.error('Leaderboard API error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}