import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, Transaction } from '@/lib/mongodb';

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

    const { transactionId, proofImage, inrAmount } = await request.json();

    if (!transactionId || !proofImage || !inrAmount) {
      return NextResponse.json({
        error: "Transaction ID, proof image, and INR amount are required"
      }, { status: 400 });
    }

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.userId.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (transaction.type !== 'deposit') {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    // Check if proof already exists
    if (transaction.paymentProof) {
      return NextResponse.json({
        error: "Payment proof already submitted for this transaction"
      }, { status: 400 });
    }

    // Update transaction with proof
    transaction.paymentProof = proofImage;
    transaction.proofImage = proofImage; // For backward compatibility
    transaction.status = 'pending';
    transaction.submittedAt = new Date();
    await transaction.save();

    console.log('Deposit proof submitted:', {
      transactionId,
      userId: decoded.id,
      amount: inrAmount,
      proofImage: proofImage.substring(0, 50) + '...'
    });

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully. Admin will verify and credit your wallet within 24 hours.",
      transactionId: transaction._id,
      status: 'submitted',
      estimatedProcessingTime: "24 hours"
    });

  } catch (error: any) {
    console.error('Deposit submit proof error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}