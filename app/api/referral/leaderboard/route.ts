import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { connectDB, User } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'referralCount'; // referralCount or credits

    // Get top referrers
    const topReferrers = await User.aggregate([
      {
        $match: {
          referralCount: { $gt: 0 } // Only users with referrals
        }
      },
      {
        $project: {
          username: 1,
          avatar: 1,
          referralCount: 1,
          credits: 1,
          isPremium: 1,
          createdAt: 1,
          score: sortBy === 'referralCount' ? '$referralCount' : '$credits'
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      }
    ]);

    // Get current user's rank if authenticated
    let currentUserRank = null;
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1];

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

        const userRank = await User.aggregate([
          {
            $match: {
              referralCount: { $gt: 0 }
            }
          },
          {
            $project: {
              username: 1,
              referralCount: 1,
              credits: 1,
              score: sortBy === 'referralCount' ? '$referralCount' : '$credits'
            }
          },
          {
            $sort: { score: -1 }
          },
          {
            $group: {
              _id: null,
              users: { $push: '$$ROOT' }
            }
          },
          {
            $addFields: {
              userIndex: {
                $indexOfArray: ['$users._id', decoded.id]
              }
            }
          }
        ]);

        if (userRank.length > 0) {
          currentUserRank = {
            rank: userRank[0].userIndex + 1,
            referralCount: topReferrers.find(u => u._id.toString() === decoded.id)?.referralCount || 0,
            credits: topReferrers.find(u => u._id.toString() === decoded.id)?.credits || 0
          };
        }
      } catch (error) {
        // Token invalid, continue without current user rank
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard: topReferrers.map((user, index) => ({
        rank: index + 1,
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        referralCount: user.referralCount,
        credits: user.credits,
        isPremium: user.isPremium,
        badge: index === 0 ? '🥇 Top Referrer' :
               index === 1 ? '🥈 2nd Place' :
               index === 2 ? '🥉 3rd Place' : null
      })),
      currentUserRank,
      sortBy,
      totalParticipants: topReferrers.length
    });

  } catch (error: any) {
    console.error('Referral leaderboard error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}