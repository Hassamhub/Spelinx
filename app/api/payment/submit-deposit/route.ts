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

    const formData = await request.formData();
    const amount = formData.get('amount') as string;
    const txnId = formData.get('txnId') as string;
    const screenshot = formData.get('screenshot') as File;

    if (!amount || !txnId || !screenshot) {
      return NextResponse.json({
        error: 'Amount, transaction ID, and screenshot are required'
      }, { status: 400 });
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 10) {
      return NextResponse.json({
        error: 'Minimum deposit amount is ₹10'
      }, { status: 400 });
    }

    // Validate screenshot
    if (!screenshot.type.startsWith('image/')) {
      return NextResponse.json({
        error: 'Screenshot must be an image file'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `deposit_${decoded.id}_${timestamp}.${screenshot.name.split('.').pop()}`;
    const proofImage = `/uploads/deposits/${filename}`;

    // In a real application, you would save the file to disk/cloud storage here
    // For now, we'll just store the filename reference
    console.log('Deposit screenshot received:', {
      filename,
      size: screenshot.size,
      type: screenshot.type,
      userId: decoded.id
    });

    // Create transaction record
    const transaction = new Transaction({
      userId: decoded.id,
      type: 'deposit',
      amount: numericAmount,
      status: 'pending',
      description: `Deposit request - ₹${numericAmount}`,
      paymentProof: proofImage,
      proofImage,
      submittedAt: new Date()
    });

    await transaction.save();

    console.log('Deposit submitted:', {
      transactionId: transaction._id,
      userId: decoded.id,
      amount: numericAmount,
      txnId
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted successfully! It will be verified within 24 hours.',
      transactionId: transaction._id,
      status: 'submitted',
      estimatedProcessingTime: "24 hours",
      instructions: [
        "1. Your deposit request has been submitted",
        "2. Admin will verify your payment within 24 hours",
        "3. Amount will be credited to your wallet once approved",
        "4. You'll receive a notification when processed"
      ]
    });

  } catch (error: any) {
    console.error('Payment submit deposit error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}