import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import Referral from '@/models/Referral';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    // Get referral stats
    const referrals = await Referral.find({ referrerId: decoded.id });
    const completed = referrals.filter(r => r.status === 'completed');

    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      totalEarned: completed.length * 100, // 100 INX per referral
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Get referral stats error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}