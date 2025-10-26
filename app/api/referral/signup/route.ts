import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, User, Referral, AuditLog, Wallet } from '@/lib/mongodb';
import referralConfig from '@/lib/referralConfig';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, referralCode } = await request.json();

    // Get client IP address for anti-abuse measures
    const clientIP = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    await connectDB();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
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

    // Check for duplicate IP signups (anti-abuse)
    const recentSignupsFromIP = await User.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      // Note: In production, you'd want to store IP addresses for this check
    });

    if (recentSignupsFromIP.length >= referralConfig.maxReferralsPerIP) {
      return NextResponse.json(
        { error: 'Too many signups from this IP address. Please try again later.' },
        { status: 429 }
      );
    }

    // Handle referral code validation
    let referrerUser = null;
    if (referralCode) {
      // Find referrer by referral code
      referrerUser = await User.findOne({
        referralCode: referralCode.toUpperCase()
      });

      if (!referrerUser) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }

      // Prevent self-referral
      if (referrerUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Cannot use your own referral code' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      referredBy: referrerUser ? referrerUser._id : undefined
    });

    await newUser.save();

    // Generate unique referral code
    newUser.referralCode = `SPELINX${newUser._id.toString().slice(-6).toUpperCase()}`;
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: 'user',
        isAdmin: false,
        isPremium: false
      },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    // Create default wallet
    const wallet = new Wallet({ userId: newUser._id });

    // Give bonus credits to new user
    wallet.balance = referralConfig.bonusCredits;
    await wallet.save();

    // Handle referral if provided
    if (referrerUser) {
      try {
        // Create referral record
        const referral = new Referral({
          referrerId: referrerUser._id,
          refereeId: newUser._id,
          status: 'pending',
          rewardType: referralConfig.rewardType
        });

        await referral.save();

        // Log the referral action
        const auditLog = new AuditLog({
          userId: newUser._id,
          action: 'signup_with_referral',
          details: `Signed up with referral from ${referrerUser.username}`,
          ipAddress: clientIP
        });
        await auditLog.save();

      } catch (referralError) {
        console.error('Referral processing error:', referralError);
        // Don't fail signup if referral processing fails
      }
    }

    // Log successful signup
    const auditLog = new AuditLog({
      userId: newUser._id,
      action: 'user_signup',
      details: `New user registered: ${username}`,
      ipAddress: clientIP
    });
    await auditLog.save();

    return NextResponse.json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: 'user',
        isAdmin: false,
        isPremium: false,
        avatar: newUser.avatar,
        theme: newUser.theme,
        referralCode: newUser.referralCode,
        referralCount: newUser.referralCount,
        credits: newUser.credits
      },
      wallet: {
        balance: wallet.balance,
        totalDeposits: wallet.totalDeposits,
        totalWithdrawals: wallet.totalWithdrawals,
        transactions: wallet.transactions || []
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Referral signup error:', error);

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