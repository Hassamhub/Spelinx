import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import { PremiumPaymentProof } from '@/models/Transaction';

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

    const { transactionId, proofImage, planType } = await request.json();

    if (!transactionId || !proofImage || !planType) {
      return NextResponse.json({
        error: "Transaction ID, proof image, and plan type required"
      }, { status: 400 });
    }

    // Check if proof already exists
    const existingProof = await PremiumPaymentProof.findOne({ transactionId });
    if (existingProof) {
      return NextResponse.json({
        error: "Payment proof already submitted for this transaction"
      }, { status: 400 });
    }

    // Pricing - should match frontend
    const pricing = {
      monthly: { cost: 499, name: "Monthly Plan", days: 30 },
      quarterly: { cost: 1200, name: "Quarterly Plan", days: 90 },
      semiAnnual: { cost: 2200, name: "Semi-Annual Plan", days: 180 },
      yearly: { cost: 3999, name: "Yearly Plan", days: 365 },
      lifetime: { cost: 10000, name: "Lifetime Plan", days: 3650 }
    };

    const selectedPlan = pricing[planType as keyof typeof pricing];
    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Create payment proof record
    const paymentProof = new PremiumPaymentProof({
      transactionId,
      userId: decoded.id,
      planType,
      amount: selectedPlan.cost,
      proofImage,
      status: 'submitted',
      submittedAt: new Date()
    });

    await paymentProof.save();

    console.log('Payment proof submitted:', {
      transactionId,
      userId: decoded.id,
      planType,
      amount: selectedPlan.cost
    });

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully. Admin will verify and process your premium activation within 24 hours.",
      proofId: paymentProof._id,
      transactionId: paymentProof.transactionId,
      status: 'submitted',
      estimatedProcessingTime: "24 hours"
    });

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