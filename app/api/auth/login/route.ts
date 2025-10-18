import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, User, Wallet } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  console.log('Login attempt received');

  try {
    const { email, password } = await request.json();
    console.log('Login data:', { email, password: '***' });

    await connectDB();
    console.log('Database connected');

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user
    console.log('Searching for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', !!user);

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    console.log('User data:', { id: user._id, email: user.email, isAdmin: user.isAdmin });

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { error: `Account is banned${user.banReason ? ': ' + user.banReason : ''}` },
        { status: 403 }
      );
    }

    // Ensure user has isAdmin field (for backward compatibility)
    if (user.isAdmin === undefined) {
      user.isAdmin = false;
    }

    // Verify password
    console.log('Verifying password...');
    console.log('Stored hash:', user.password.substring(0, 20) + '...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Password verification failed');
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
        role: user.role || 'user',
        isAdmin: user.isAdmin || false,
        isPremium: user.isPremium || false,
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
    console.log('Getting wallet data...');
    let wallet = await Wallet.findOne({ userId: user._id });
    console.log('Wallet found:', !!wallet);

    if (!wallet) {
      console.log('Creating new wallet...');
      wallet = new Wallet({ userId: user._id });
      await wallet.save();
      console.log('Wallet created');
    }

    // Return response
    const response = NextResponse.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        isAdmin: user.isAdmin || false,
        isPremium: user.isPremium || false,
        premiumExpiresAt: user.premiumExpiresAt,
        avatar: user.avatar,
        theme: user.theme,
        banner: user.banner
      },
      wallet: {
        balance: wallet.balance || 0,
        totalDeposits: wallet.totalDeposits || 0,
        totalWithdrawals: wallet.totalWithdrawals || 0,
        transactions: wallet.transactions || []
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

  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);

    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided: ' + Object.values(error.errors).map((e: any) => e.message).join(', ') },
        { status: 400 }
      );
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      return NextResponse.json(
        { error: 'Database connection issue' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Server error during login: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}