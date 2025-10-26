import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB, Transaction, User, StoreItem, Theme, UserThemes, ThemeSale } from '@/lib/mongodb';

export async function POST(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    await connectDB();

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const { notes } = await request.json();

    // Find the store payment transaction
    const payment = await Transaction.findById(params.paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Store payment not found' }, { status: 404 });
    }

    // Check if it's actually a store payment
    if (payment.type !== 'store_payment') {
      return NextResponse.json({ error: 'Transaction is not a store payment' }, { status: 400 });
    }

    // Check if already processed
    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Store payment has already been processed' }, { status: 400 });
    }

    // Use MongoDB transaction for atomic operations
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Update transaction status
        payment.status = 'completed';
        payment.verified = true;
        payment.verifiedAt = new Date();
        payment.verifiedBy = 'admin';
        await payment.save({ session });

        // Determine if it's a theme or regular store item
        if (payment.description?.includes('Theme')) {
          const themeName = payment.description.match(/Theme (.+) purchase/)?.[1];
          if (themeName) {
            const theme = await Theme.findOne({ name: themeName }).session(session);
            if (theme) {
              // Create UserThemes entry
              const userTheme = new UserThemes({
                userId: payment.userId,
                themeId: theme._id,
                active: false,
                purchasedAt: new Date()
              });
              await userTheme.save({ session });

              // Create ThemeSale record
              const themeSale = new ThemeSale({
                userId: payment.userId,
                themeId: theme._id,
                amount: payment.amount,
                transactionId: payment.transactionId
              });
              await themeSale.save({ session });
            }
          }
        } else {
          // Handle regular store items if needed (e.g., for avatars)
          // For now, assume themes are handled separately
        }
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      message: 'Store payment approved successfully',
      payment: {
        _id: payment._id,
        userId: {
          username: (await User.findById(payment.userId))?.username || 'unknown',
          email: (await User.findById(payment.userId))?.email || 'unknown'
        },
        amount: payment.amount,
        transactionId: payment._id,
        status: 'approved',
        paymentProof: payment.proofImage,
        adminNotes: payment.description,
        submittedAt: payment.createdAt,
        reviewedBy: { username: 'admin' },
        reviewedAt: payment.verifiedAt,
      }
    });

  } catch (error: any) {
    console.error('Approve store payment error:', error);
    return NextResponse.json(
      { error: 'Failed to approve store payment: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}