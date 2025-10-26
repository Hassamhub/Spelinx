import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/mongodb';

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB();

    const { ban, reason } = await request.json();

    const user = await User.findByIdAndUpdate(
      params.userId,
      {
        isBanned: ban,
        banReason: ban ? reason : undefined
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `User ${ban ? 'banned' : 'unbanned'} successfully`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        isAdmin: user.isAdmin,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        isBanned: user.isBanned,
        banReason: user.banReason,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        avatar: user.avatar,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
      }
    });

  } catch (error: any) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user ban status: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}