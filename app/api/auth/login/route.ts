import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, User, Wallet } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    await connectDB();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { error: `Account is banned${user.banReason ? ': ' + user.banReason : ''}` },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isAdmin: user.isAdmin,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt
      },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1h' }
    );

    // Update login tracking
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Get wallet data
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({ userId: user._id });
      await wallet.save();
    }

    // Return response
    const response = NextResponse.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        avatar: user.avatar,
        theme: user.theme,
        banner: user.banner
      },
      wallet: {
        balance: wallet.balance,
        totalDeposits: wallet.totalDeposits,
        totalWithdrawals: wallet.totalWithdrawals,
        transactions: wallet.transactions
      }
    });

    // Set secure cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error during login' },
      { status: 500 }
    );
  }
}