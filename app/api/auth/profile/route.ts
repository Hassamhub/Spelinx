import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User, Wallet, Transaction } from '@/lib/mongodb';
export const dynamic = 'force-dynamic'

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

    // Calculate user stats
    const totalGamesPlayed = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: 'gamehistories',
          localField: '_id',
          foreignField: 'userId',
          as: 'games'
        }
      },
      {
        $addFields: {
          totalGames: { $size: '$games' }
        }
      },
      {
        $project: {
          totalGames: 1
        }
      }
    ]);

    const gamesCount = totalGamesPlayed.length > 0 ? totalGamesPlayed[0].totalGames : 0;

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type amount status description createdAt');

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme || 'default',
        level: user.level || 1,
        xp: user.xp || 0,
        walletBalance: wallet?.balance || 0,
        totalEarnings: user.totalEarnings || 0,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        isPremium: user.isPremium || false,
        premiumExpiresAt: user.premiumExpiresAt,
        isAdmin: user.isAdmin || false,
        isBanned: user.isBanned || false,
        banReason: user.banReason,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Additional computed fields
        gamesPlayed: gamesCount,
        balance: wallet?.balance || 0,
        inx: wallet?.balance || 0 // INX is the same as balance in this system
      },
      wallet: wallet ? {
        _id: wallet._id,
        balance: wallet.balance || 0,
        totalDeposits: wallet.totalDeposits || 0,
        totalWithdrawals: wallet.totalWithdrawals || 0,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt
      } : null,
      recentTransactions: recentTransactions.map(t => ({
        _id: t._id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt
      }))
    });

  } catch (error: any) {
    console.error('Profile API error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    const updateData = await request.json();

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update allowed fields only
    const allowedFields = ['username', 'avatar', 'theme', 'font', 'referralCode'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { ...filteredData, updatedAt: new Date() },
      { new: true }
    );

    console.log('Profile updated:', {
      userId: decoded.id,
      updatedFields: Object.keys(filteredData)
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        theme: updatedUser.theme || 'default',
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Profile update error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}