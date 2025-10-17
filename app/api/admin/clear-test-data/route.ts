import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Wallet from '@/models/Wallet'
import Referral from '@/models/Referral'
import GameHistory from '@/models/GameHistory'
import Transaction from '@/models/Transaction'

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

    // Verify token and check admin status
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any

    // Check if user is admin
    const adminUser = await User.findById(decoded.id)
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('Clearing test data initiated by admin:', adminUser.username)

    // Clear test data (you can customize what to clear)
    const clearOperations = []

    // Clear non-admin users (be careful with this!)
    // const testUsers = await User.find({ isAdmin: false })
    // clearOperations.push(User.deleteMany({ isAdmin: false }))

    // Clear wallets for non-admin users
    // const adminIds = (await User.find({ isAdmin: true })).map(u => u._id)
    // clearOperations.push(Wallet.deleteMany({ userId: { $nin: adminIds } }))

    // Clear game history
    clearOperations.push(GameHistory.deleteMany({}))

    // Clear transactions
    clearOperations.push(Transaction.deleteMany({}))

    // Clear referrals
    clearOperations.push(Referral.deleteMany({}))

    // Clear dummy leaderboard data (if stored in DB)
    // Add more clear operations as needed

    // Execute all clear operations
    const results = await Promise.all(clearOperations)

    console.log('Test data cleared successfully:', results)

    // Log the admin action
    const adminLog = {
      adminId: adminUser._id,
      action: 'clear_test_data',
      timestamp: new Date(),
      details: 'Cleared all test data from the system'
    }

    return NextResponse.json({
      success: true,
      message: 'Test data cleared successfully',
      clearedItems: {
        gameHistory: results[0]?.deletedCount || 0,
        transactions: results[1]?.deletedCount || 0,
        referrals: results[2]?.deletedCount || 0
      }
    })

  } catch (error: any) {
    console.error('Clear test data error:', error)

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