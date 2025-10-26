import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User, Wallet, Transaction } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from header
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    const { amount, upiId } = await request.json();

    if (!amount || !upiId) {
      return NextResponse.json({
        error: 'Amount and UPI ID are required'
      }, { status: 400 });
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 100) {
      return NextResponse.json({
        error: 'Minimum withdrawal amount is ₹100'
      }, { status: 400 });
    }

    if (numericAmount > 10000) {
      return NextResponse.json({
        error: 'Maximum withdrawal amount is ₹10,000 per request'
      }, { status: 400 });
    }

    // Validate UPI ID format
    const upiRegex = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z][a-zA-Z.-]{2,64}$/;
    if (!upiRegex.test(upiId)) {
      return NextResponse.json({
        error: 'Invalid UPI ID format'
      }, { status: 400 });
    }

    // Get user and wallet
    const user = await User.findById(decoded.id);
    const wallet = await Wallet.findOne({ userId: decoded.id });

    if (!user || !wallet) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check balance
    if (wallet.balance < numericAmount) {
      return NextResponse.json({
        error: 'Insufficient balance',
        available: wallet.balance,
        requested: numericAmount
      }, { status: 402 });
    }

    // Temporarily deduct amount (will be confirmed by admin)
    wallet.balance -= numericAmount;
    wallet.totalWithdrawals += numericAmount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: decoded.id,
      type: 'withdrawal',
      amount: numericAmount,
      status: 'pending',
      description: `Withdrawal request - ₹${numericAmount} to ${upiId}`,
      submittedAt: new Date()
    });

    await transaction.save();

    // Add transaction to wallet
    wallet.transactions.push(transaction._id);
    await wallet.save();

    // Update user total earnings
    user.totalEarnings -= numericAmount;
    await user.save();

    console.log('Withdrawal requested:', {
      transactionId: transaction._id,
      userId: decoded.id,
      amount: numericAmount,
      upiId
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully! It will be processed within 24-48 hours.',
      transactionId: transaction._id,
      amount: numericAmount,
      upiId,
      status: 'pending',
      newBalance: wallet.balance,
      estimatedProcessingTime: "24-48 hours",
      instructions: [
        "1. Your withdrawal request has been submitted",
        "2. Admin will verify and process within 24-48 hours",
        "3. Amount will be transferred to your UPI ID",
        "4. You'll receive a notification when completed"
      ]
    });

  } catch (error: any) {
    console.error('Payment request withdrawal error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}