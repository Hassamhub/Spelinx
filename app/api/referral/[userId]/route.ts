import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User, Referral, AuditLog } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    // Verify token and check admin access
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    // Check if user is admin
    const adminUser = await User.findById(decoded.id);
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = params;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all referrals for this user (both as referrer and referee)
    const [asReferrer, asReferee] = await Promise.all([
      Referral.find({ referrerId: userId })
        .populate('refereeId', 'username email avatar')
        .sort({ createdAt: -1 }),
      Referral.find({ refereeId: userId })
        .populate('referrerId', 'username email avatar')
        .sort({ createdAt: -1 })
    ]);

    // Log admin action
    const auditLog = new AuditLog({
      userId: adminUser._id,
      action: 'admin_view_referrals',
      details: `Admin viewed referrals for user ${user.username}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });
    await auditLog.save();

    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        credits: user.credits
      },
      referrals: {
        asReferrer,
        asReferee
      }
    });

  } catch (error: any) {
    console.error('Get user referrals error:', error);

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