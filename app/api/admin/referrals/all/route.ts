import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User, Referral, AuditLog } from '@/lib/mongodb';

export const dynamic = 'force-dynamic'

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

    // Get all referrals with user details
    const referrals = await Referral.find()
      .populate('referrerId', 'username email avatar referralCount credits')
      .populate('refereeId', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(100); // Limit for performance

    // Log admin action
    const auditLog = new AuditLog({
      userId: adminUser._id,
      action: 'admin_view_all_referrals',
      details: `Admin viewed all referrals`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });
    await auditLog.save();

    return NextResponse.json({
      referrals: referrals.map(referral => ({
        _id: referral._id,
        referrerId: referral.referrerId,
        refereeId: referral.refereeId,
        status: referral.status,
        rewardGiven: referral.rewardGiven,
        rewardType: referral.rewardType,
        referredAt: referral.referredAt,
        createdAt: referral.createdAt
      })),
      total: referrals.length
    });

  } catch (error: any) {
    console.error('Get all referrals error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}