import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

// Mock pricing data - should match frontend
const pricing = {
  monthly: { cost: 499, name: "Monthly Plan" },
  quarterly: { cost: 1200, name: "Quarterly Plan" },
  semiAnnual: { cost: 2200, name: "Semi-Annual Plan" },
  yearly: { cost: 3999, name: "Yearly Plan" },
  lifetime: { cost: 10000, name: "Lifetime Plan" }
};

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

    const { type } = await request.json();

    // Validate type parameter
    const validTypes = ['monthly', 'quarterly', 'semiAnnual', 'yearly', 'lifetime'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({
        error: `Invalid premium type. Available types are: ${validTypes.join(', ')}`,
        validTypes
      }, { status: 400 });
    }

    const selectedPlan = pricing[type as keyof typeof pricing];

    // Generate unique transaction ID
    const transactionId = `PREMIUM_${Date.now()}_${decoded.id}_${type}`;

    // UPI details from environment
    const upiId = process.env.FAMPAY_UPI_ID || "merchant@fam";
    const merchantName = process.env.MERCHANT_NAME || "SPELINX Gaming";

    // Create UPI URI
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${selectedPlan.cost}&cu=INR&tn=${encodeURIComponent(`${selectedPlan.name} - SPELINX Premium`)}`;

    // Create payment details
    const paymentDetails = {
      transactionId,
      userId: decoded.id,
      type,
      amount: selectedPlan.cost,
      upiId,
      merchantName,
      qrData: upiUri,
      planName: selectedPlan.name,
      status: 'pending',
      createdAt: new Date(),
      notes: `Premium ${selectedPlan.name} payment - ₹${selectedPlan.cost}`
    };

    console.log('Payment initiation:', {
      userId: decoded.id,
      type,
      amount: selectedPlan.cost,
      transactionId
    });

    return NextResponse.json({
      success: true,
      paymentDetails,
      message: "Payment initiated successfully. Please complete the UPI transaction and upload proof.",
      instructions: "1. Scan QR code or use UPI ID to pay. 2. Upload payment proof image. 3. Wait for admin approval. 4. INX will be credited to your wallet."
    });

  } catch (error: any) {
    console.error('Initiate payment error:', error);

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