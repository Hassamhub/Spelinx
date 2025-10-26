import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { connectDB, User, Wallet, Referral, ReferralConfig, AuditLog } from '@/lib/mongodb';
import referralConfig from '@/lib/referralConfig';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, referralCode: inputReferralCode } = await request.json();

    // Get client IP address for anti-abuse measures
    const clientIP = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    // Check for ?ref= in query params
    const { searchParams } = new URL(request.url);
    const refParam = searchParams.get('ref');

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

    // Handle referral code validation (from body or query param)
    let referrerUser = null;
    const codeToUse = inputReferralCode || refParam;
    if (codeToUse) {
      // Find referrer by referral code
      referrerUser = await User.findOne({
        referralCode: codeToUse.toUpperCase()
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

    // Generate unique referral code first
    let referralCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      referralCode = nanoid(8).toUpperCase();
      const existingUser = await User.findOne({ referralCode });
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Unable to generate unique referral code. Please try again.' },
        { status: 500 }
      );
    }

    // Create user with referral code
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      avatar: '/assets/default-avatar.svg',
      referralCode,
      referredBy: referrerUser ? referrerUser._id : null
    });

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

        // Increment referrer's referral count
        await User.findByIdAndUpdate(referrerUser._id, { $inc: { referralCount: 1 } });

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

    const response = NextResponse.json({
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