import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User, Wallet } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    await connectDB();

    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    // Get user with wallet info
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get wallet info
    const wallet = await Wallet.findOne({ userId: decoded.id });

    return NextResponse.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme || 'default',
        font: user.font,
        referralCode: user.referralCode,
        isPremium: user.isPremium || false,
        isAdmin: user.isAdmin || false,
        balance: wallet?.balance || 0
      }
    });

  } catch (error: any) {
    console.error('Session API error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}