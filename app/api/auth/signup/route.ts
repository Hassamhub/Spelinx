import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, User, Wallet, Referral } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, referralCode } = await request.json();

    await connectDB();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.trim() }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return NextResponse.json(
        { error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate temporary ID for referral code
    const tempId = Math.random().toString(36).substring(2, 15);

    // Create user
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      referralCode: `SPELINX${tempId.slice(-6).toUpperCase()}`
    });

    await newUser.save();

    // Update referral code with actual ID
    newUser.referralCode = `SPELINX${newUser._id.toString().slice(-6).toUpperCase()}`;
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    // Create default wallet
    const wallet = new Wallet({ userId: newUser._id });
    await wallet.save();

    // Handle referral if provided
    if (referralCode) {
      try {
        // Extract referrer ID from code - assuming SPELINX + last 6 chars of user ID uppercase
        const referrerIdPart = referralCode.replace('SPELINX', '').toLowerCase();

        // Find user by referral code
        const referrerUser = await User.findOne({
          referralCode: referralCode.toUpperCase()
        });

        if (referrerUser) {
          const referrerId = referrerUser._id.toString();

          // Create referral record
          const referral = new Referral({
            referrerId,
            referredId: newUser._id,
            referralCode,
            status: 'completed',
            completedAt: new Date(),
          });

          await referral.save();

          // Reward referrer
          const referrerWallet = await Wallet.findOne({ userId: referrerId });
          if (referrerWallet) {
            referrerWallet.balance += 100; // 100 INX reward
            await referrerWallet.save();
          }

          // Reward new user
          wallet.balance += 50; // 50 INX bonus
          await wallet.save();
        }
      } catch (referralError) {
        console.error('Referral processing error:', referralError);
        // Don't fail signup if referral processing fails
      }
    }

    const response = NextResponse.json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      wallet: {
        balance: wallet.balance,
        totalDeposits: wallet.totalDeposits,
        totalWithdrawals: wallet.totalWithdrawals
      }
    }, { status: 201 });

    // Set secure cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Signup error:', error);

    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error during signup: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}