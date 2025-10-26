import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, Theme, UserThemes, Transaction, User, ThemeSale } from '@/lib/mongodb';

export async function POST(request: NextRequest, { params }: { params: { themeId: string } }) {
  try {
    await connectDB();

    // Get token from header
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    const { themeId } = params;

    // Find the theme
    const theme = await Theme.findById(themeId);
    if (!theme || !theme.isActive) {
      return NextResponse.json({ error: 'Theme not found or inactive' }, { status: 404 });
    }

    // Check if user already owns the theme
    const existingPurchase = await UserThemes.findOne({ userId: decoded.id, themeId });
    if (existingPurchase) {
      return NextResponse.json({ error: 'Theme already purchased' }, { status: 400 });
    }

    // Generate unique transaction ID
    const transactionId = `THEME_${Date.now()}_${decoded.id}_${themeId}`;

    // UPI details from environment
    const upiId = process.env.FAMPAY_UPI_ID || "merchant@fam";
    const merchantName = process.env.MERCHANT_NAME || "SPELINX Gaming";

    // Create UPI URI
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${theme.price}&cu=INR&tn=${encodeURIComponent(`${theme.name} - SPELINX Theme`)}`;

    // Create transaction record
    const transaction = new Transaction({
      userId: decoded.id,
      transactionId,
      type: 'store_payment',
      amount: theme.price,
      description: `Theme ${theme.name} purchase - ₹${theme.price}`,
      status: 'pending'
    });
    await transaction.save();

    // Create pending ThemeSale if not already exists
    const existingSale = await ThemeSale.findOne({ transactionId });
    if (!existingSale) {
      const pendingSale = new ThemeSale({
        userId: decoded.id,
        themeId: theme._id,
        amount: theme.price,
        transactionId
      });
      await pendingSale.save();
    }

    // Create payment details
    const paymentDetails = {
      transactionId,
      userId: decoded.id,
      itemId: themeId,
      amount: theme.price,
      upiId,
      merchantName,
      qrData: upiUri,
      itemName: theme.name,
      category: 'themes',
      status: 'pending',
      createdAt: new Date(),
      notes: `Theme ${theme.name} purchase - ₹${theme.price}`
    };

    console.log('Theme purchase initiated:', {
      userId: decoded.id,
      themeId,
      amount: theme.price,
      transactionId
    });

    return NextResponse.json({
      success: true,
      paymentDetails,
      message: "Payment initiated successfully. Please complete the UPI transaction and upload proof.",
      instructions: "1. Scan QR code or use UPI ID to pay. 2. Upload payment proof image. 3. Wait for admin approval. 4. Theme will be unlocked."
    });

  } catch (error: any) {
    console.error('Theme purchase error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}