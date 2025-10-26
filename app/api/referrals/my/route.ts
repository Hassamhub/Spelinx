import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'

import jwt from 'jsonwebtoken';
import { connectDB, User, Referral } from '@/lib/mongodb';

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

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get referral count
    const referralStats = await Referral.aggregate([
      { $match: { referrerId: user._id } },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 }
        }
      }
    ]);

    const referralCount = referralStats.length > 0 ? referralStats[0].totalReferrals : 0;

    return NextResponse.json({
      referralCode: user.referralCode,
      referralCount
    });

  } catch (error: any) {
    console.error('Get referrals/my error:', error);

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