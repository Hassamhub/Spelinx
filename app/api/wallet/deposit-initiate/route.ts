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

    const { inrAmount } = await request.json();

    if (!inrAmount || inrAmount < 10) {
      return NextResponse.json(
        { error: 'Minimum deposit amount is ₹10' },
        { status: 400 }
      );
    }

    // Generate unique transaction ID
    const transactionId = `DEPOSIT_${Date.now()}_${decoded.id}`;

    // UPI details from environment
    const upiId = process.env.FAMPAY_UPI_ID || "merchant@fam";
    const merchantName = process.env.MERCHANT_NAME || "SPELINX Gaming";

    // Create UPI URI
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${inrAmount}&cu=INR&tn=${encodeURIComponent(`SPELINX Deposit - ₹${inrAmount}`)}`;

    // Create transaction record
    const transaction = new Transaction({
      userId: decoded.id,
      type: 'deposit',
      amount: inrAmount,
      status: 'pending',
      description: `Deposit request - ₹${inrAmount}`,
      submittedAt: new Date(),
      transactionId: transactionId
    });

    await transaction.save();

    console.log('Deposit initiated:', {
      userId: decoded.id,
      amount: inrAmount,
      transactionId: transaction._id
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction._id,
      amount: inrAmount,
      upiId,
      merchantName,
      qrData: upiUri,
      message: "Deposit initiated. Please complete the UPI transaction and upload proof.",
      instructions: [
        "1. Use the UPI ID or scan QR code to pay",
        "2. Upload payment screenshot",
        "3. Wait for admin verification (usually within 24 hours)",
        "4. Amount will be credited to your wallet"
      ]
    });

  } catch (error: any) {
    console.error('Deposit initiate error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}