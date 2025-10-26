import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Aggregate users by referral count, sorted descending
    const leaderboard = await User.aggregate([
      {
        $match: { referralCount: { $gt: 0 } }
      },
      {
        $project: {
          username: 1,
          referralCount: 1
        }
      },
      {
        $sort: { referralCount: -1 }
      },
      {
        $limit: 10 // Top 10
      }
    ]);

    return NextResponse.json({
      success: true,
      leaderboard
    });

  } catch (error: any) {
    console.error('Referral leaderboard error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}