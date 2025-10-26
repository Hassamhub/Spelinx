import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User, Wallet, Transaction } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie or header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    const { transactionId, proofImage, planType, amount } = await request.json();

    if (!transactionId || !proofImage || !planType) {
      return NextResponse.json({
        error: "Transaction ID, proof image, and plan type required"
      }, { status: 400 });
    }

    if (planType === 'store') {
      // Find the store payment transaction
      const transaction = await Transaction.findOne({
        userId: decoded.id,
        _id: transactionId
      });

      if (!transaction) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      // Check if proof already exists
      if (transaction.proofImage) {
        return NextResponse.json({
          error: "Payment proof already submitted for this transaction"
        }, { status: 400 });
      }

      // Update transaction with proof
      transaction.proofImage = proofImage;
      transaction.submittedAt = new Date();
      transaction.status = 'pending';
      await transaction.save();

      console.log('Store payment proof submitted:', {
        transactionId,
        userId: decoded.id,
        amount: transaction.amount
      });

      return NextResponse.json({
        success: true,
        message: "Payment proof submitted successfully. Admin will verify and process your purchase within 24 hours.",
        proofId: transaction._id,
        transactionId: transactionId,
        status: 'submitted',
        estimatedProcessingTime: "24 hours"
      });
    } else {
      // Premium payment
      // Check if proof already exists
      const existingProof = await Transaction.findOne({
        userId: decoded.id,
        type: { $in: ['premium_payment', 'store_payment'] },
        proofImage: { $exists: true }
      });
      if (existingProof) {
        return NextResponse.json({
          error: "Payment proof already submitted for this transaction"
        }, { status: 400 });
      }

      const validPremiumTypes = ['monthly', 'quarterly', 'semiAnnual', 'yearly', 'lifetime'];
      const isPremium = validPremiumTypes.includes(planType);

      // Create transaction record for payment proof
      const transaction = new Transaction({
        userId: decoded.id,
        type: planType === 'store' ? 'store_payment' : 'premium_payment',
        amount: amount,
        description: planType === 'store' ? 'Store item payment proof' : `${planType} premium payment proof`,
        proofImage,
        submittedAt: new Date(),
        status: 'pending'
      });

      await transaction.save();

      console.log(`${planType === 'store' ? 'Store' : 'Premium'} payment proof submitted:`, {
        transactionId,
        userId: decoded.id,
        planType,
        amount: amount
      });

      return NextResponse.json({
        success: true,
        message: planType === 'store'
          ? "Payment proof submitted successfully. Admin will verify and process your purchase within 24 hours."
          : "Payment proof submitted successfully. Admin will verify and process your premium activation within 24 hours.",
        proofId: transaction._id,
        transactionId: transactionId,
        status: 'submitted',
        estimatedProcessingTime: "24 hours"
      });
    }

  } catch (error: any) {
    console.error('Submit proof error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}