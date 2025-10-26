import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'

import jwt from 'jsonwebtoken';
import { connectDB, User, Wallet, Transaction } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from header
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    // Get user and wallet
    const user = await User.findById(decoded.id);
    const wallet = await Wallet.findOne({ userId: decoded.id });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!wallet) {
      // Create wallet if it doesn't exist
      const newWallet = new Wallet({ userId: decoded.id });
      await newWallet.save();

      return NextResponse.json({
        success: true,
        balance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        transactions: []
      });
    }

    // Get recent transactions
    const transactions = await Transaction.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      balance: wallet.balance || 0,
      totalDeposits: wallet.totalDeposits || 0,
      totalWithdrawals: wallet.totalWithdrawals || 0,
      transactions: transactions.map(t => ({
        _id: t._id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt
      }))
    });

  } catch (error: any) {
    console.error('Wallet API error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}