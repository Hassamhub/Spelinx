import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import jwt from 'jsonwebtoken';
import { connectDB, User, Referral, Wallet } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    // Get user with referral stats
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Ensure user has a referral code; generate if missing
    if (!user.referralCode) {
      const base = (user.username || 'USER').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'USER';
      let code = '';
      let attempt = 0;
      while (attempt < 6) {
        const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
        code = `${base}${suffix}`;
        const exists = await User.findOne({ referralCode: code });
        if (!exists) break;
        attempt++;
      }
      user.referralCode = code;
      await user.save({ validateBeforeSave: false });
    }

    // Get wallet info
    const wallet = await Wallet.findOne({ userId: decoded.id });

    // Get referral statistics
    const referralStats = await Referral.aggregate([
      { $match: { referrerId: user._id } },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          completedReferrals: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = referralStats.length > 0 ? referralStats[0] : {
      totalReferrals: 0,
      completedReferrals: 0
    };

    // Calculate total rewards earned
    const totalRewards = stats.completedReferrals * 100; // 100 credits per referral

    // Generate referral link
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?ref=${user.referralCode}`;

    return NextResponse.json({
      referralLink,
      referralCode: user.referralCode,
      referralCount: stats.totalReferrals,
      completedReferrals: stats.completedReferrals,
      credits: user.credits || 0,
      totalRewards,
      availableBalance: wallet?.balance || 0
    });

  } catch (error: any) {
    console.error('Get referral link error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}