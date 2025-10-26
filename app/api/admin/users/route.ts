import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/mongodb';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const users = await User.find({})
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    return NextResponse.json({
      users: users.map(user => ({
        _id: user._id,
        username: user.username || 'Unknown',
        email: user.email || 'N/A',
        level: user.level || 1,
        xp: user.xp || 0,
        walletBalance: user.walletBalance || 0,
        totalEarnings: user.totalEarnings || 0,
        isAdmin: user.isAdmin || false,
        isPremium: user.isPremium || false,
        premiumExpiresAt: user.premiumExpiresAt,
        isBanned: user.isBanned || false,
        banReason: user.banReason,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount || 0,
        createdAt: user.createdAt,
        avatar: user.avatar,
        theme: user.theme,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
      })),
      total,
      page,
      limit,
    });

  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}