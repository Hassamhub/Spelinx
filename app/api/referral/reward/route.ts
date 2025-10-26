import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User, Referral, Wallet, AuditLog, StoreItem } from '@/lib/mongodb';
import referralConfig from '@/lib/referralConfig';

export async function POST(request: NextRequest) {
  try {
    const { refereeId, rewardType } = await request.json();

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

    // Validate input
    if (!refereeId) {
      return NextResponse.json(
        { error: 'Referee ID is required' },
        { status: 400 }
      );
    }

    // Find the referral record
    const referral = await Referral.findOne({
      refereeId,
      status: 'pending'
    });

    if (!referral) {
      return NextResponse.json(
        { error: 'No pending referral found for this user' },
        { status: 404 }
      );
    }

    // Prevent double rewarding
    if (referral.rewardGiven) {
      return NextResponse.json(
        { error: 'Referral already rewarded' },
        { status: 400 }
      );
    }

    // Get referrer and referee
    const [referrer, referee] = await Promise.all([
      User.findById(referral.referrerId),
      User.findById(refereeId)
    ]);

    if (!referrer || !referee) {
      return NextResponse.json(
        { error: 'Referrer or referee not found' },
        { status: 404 }
      );
    }

    // Get wallets
    const [referrerWallet, refereeWallet] = await Promise.all([
      Wallet.findOne({ userId: referrer._id }),
      Wallet.findOne({ userId: refereeId })
    ]);

    // Update referral status
    referral.status = 'completed';
    referral.rewardGiven = true;
    referral.rewardType = rewardType || referralConfig.rewardType;
    await referral.save();

    // Reward referrer
    if (referrerWallet) {
      const rewardAmount = rewardType === 'theme' ? 0 : referralConfig.rewardPerReferral;
      referrerWallet.balance += rewardAmount;
      referrer.credits += rewardAmount;
      referrer.referralCount += 1;
      await Promise.all([referrerWallet.save(), referrer.save()]);
    }

    // Reward referee (bonus credits)
    if (refereeWallet) {
      refereeWallet.balance += referralConfig.bonusCredits;
      referee.credits += referralConfig.bonusCredits;
      await Promise.all([refereeWallet.save(), referee.save()]);
    }

    // Check if referrer qualifies for theme unlock
    if (referrer.referralCount >= referralConfig.themeUnlockAfter) {
      // Unlock gold theme or similar premium benefit
      const goldTheme = await StoreItem.findOne({ category: 'themes', name: 'Gold Theme' });
      if (goldTheme) {
        // Add theme to user's purchased items or unlock it
        // This could be implemented as a user flag or separate collection
        referrer.unlockedThemes = referrer.unlockedThemes || [];
        if (!referrer.unlockedThemes.includes(goldTheme._id.toString())) {
          referrer.unlockedThemes.push(goldTheme._id.toString());
          await referrer.save();
        }
      }
    }

    // Log the reward action
    const auditLog = new AuditLog({
      userId: adminUser._id,
      action: 'referral_reward_given',
      details: `Referral reward given: ${referrer.username} -> ${referee.username}, Amount: ${referralConfig.rewardPerReferral}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });
    await auditLog.save();

    return NextResponse.json({
      success: true,
      message: 'Referral reward processed successfully',
      data: {
        referralId: referral._id,
        referrer: {
          id: referrer._id,
          username: referrer.username,
          newReferralCount: referrer.referralCount,
          newCredits: referrer.credits
        },
        referee: {
          id: referee._id,
          username: referee.username,
          bonusCredits: referralConfig.bonusCredits
        }
      }
    });

  } catch (error: any) {
    console.error('Referral reward error:', error);

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