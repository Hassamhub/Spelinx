import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import Referral from '@/models/Referral'
import Wallet from '@/models/Wallet'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any

    const { referralId } = await request.json()

    // Find referral
    const referral = await Referral.findById(referralId)
    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    // Check if user owns this referral
    if (referral.referrerId.toString() !== decoded.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if reward already claimed
    if (referral.rewardClaimed) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 }
      )
    }

    // Check if referred user is premium (for bonus)
    const referredUser = await User.findById(referral.referredId)
    const bonusReward = referredUser?.isPremium ? 15 : 0 // Additional 15 INX if premium

    // Calculate total reward
    const baseReward = 10 // Base 10 INX per referral
    const totalReward = baseReward + bonusReward

    // Update wallet
    const referrerWallet = await Wallet.findOne({ userId: decoded.id })
    if (referrerWallet) {
      referrerWallet.inx += totalReward
      await referrerWallet.save()
    }

    // Mark reward as claimed
    referral.rewardClaimed = true
    referral.rewardAmount = totalReward
    referral.rewardClaimedAt = new Date()
    await referral.save()

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${totalReward} INX reward!`,
      reward: totalReward,
      bonus: bonusReward
    })

  } catch (error: any) {
    console.error('Claim referral reward error:', error)

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

// GET - Get referral rewards for user
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any

    // Get user's referrals with rewards info
    const referrals = await Referral.find({ referrerId: decoded.id })
      .populate('referredId', 'username isPremium')
      .sort({ createdAt: -1 })

    const rewards = referrals.map(referral => ({
      id: referral._id,
      referredUser: referral.referredId.username,
      isPremium: referral.referredId.isPremium,
      status: referral.status,
      baseReward: 10,
      bonusReward: referral.referredId.isPremium ? 15 : 0,
      totalReward: 10 + (referral.referredId.isPremium ? 15 : 0),
      claimed: referral.rewardClaimed,
      claimedAt: referral.rewardClaimedAt,
      createdAt: referral.createdAt
    }))

    return NextResponse.json({ rewards })

  } catch (error: any) {
    console.error('Get referral rewards error:', error)

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}