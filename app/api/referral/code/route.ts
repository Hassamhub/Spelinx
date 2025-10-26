import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User } from '@/lib/mongodb';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      // Generate a default referral code for non-authenticated users
      const referralCode = `SPELINX${Date.now().toString().slice(-6).toUpperCase()}`;
      return NextResponse.json({ referralCode });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

      // Generate referral code based on user ID
      const referralCode = `SPELINX${decoded.id.slice(-6).toUpperCase()}`;

      return NextResponse.json({ referralCode });
    } catch (jwtError) {
      // Token expired or invalid, generate default code
      const referralCode = `SPELINX${Date.now().toString().slice(-6).toUpperCase()}`;
      return NextResponse.json({ referralCode });
    }

  } catch (error) {
    console.error('Get referral code error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}