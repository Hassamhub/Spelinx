import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Transaction, User } from '@/lib/mongodb';

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

    // Find the premium payment transaction
    const payment = await Transaction.findById(params.paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Premium payment not found' }, { status: 404 });
    }

    // Check if it's actually a premium payment
    if (payment.type !== 'premium_payment') {
      return NextResponse.json({ error: 'Transaction is not a premium payment' }, { status: 400 });
    }

    // Check if already processed
    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Premium payment has already been processed' }, { status: 400 });
    }

    // Update transaction status
    payment.status = 'completed';
    payment.verified = true;
    payment.verifiedAt = new Date();
    payment.verifiedBy = 'admin';
    await payment.save();

    // Update user premium status
    const user = await User.findById(payment.userId);
    if (user) {
      // Extract plan type from description or use default
      const planType = payment.description?.includes('daily') ? 'daily' :
                      payment.description?.includes('weekly') ? 'weekly' :
                      payment.description?.includes('monthly') ? 'monthly' :
                      payment.description?.includes('quarterly') ? 'quarterly' :
                      payment.description?.includes('semi') ? 'semiAnnual' :
                      payment.description?.includes('yearly') ? 'yearly' :
                      payment.description?.includes('lifetime') ? 'lifetime' : 'monthly';

      // Set premium status based on plan type
      user.isPremium = true;
      if (planType !== 'lifetime') {
        // Set expiration date based on plan type
        const now = new Date();
        const expirationDate = new Date(now);

        switch (planType) {
          case 'daily':
            expirationDate.setDate(now.getDate() + 1);
            break;
          case 'weekly':
            expirationDate.setDate(now.getDate() + 7);
            break;
          case 'monthly':
            expirationDate.setMonth(now.getMonth() + 1);
            break;
          case 'quarterly':
            expirationDate.setMonth(now.getMonth() + 3);
            break;
          case 'semiAnnual':
            expirationDate.setMonth(now.getMonth() + 6);
            break;
          case 'yearly':
            expirationDate.setFullYear(now.getFullYear() + 1);
            break;
        }
        user.premiumExpiresAt = expirationDate;
      } else {
        // Lifetime premium - no expiration
        user.premiumExpiresAt = undefined;
      }

      await user.save();
    }

    return NextResponse.json({
      message: 'Premium payment approved successfully',
      payment: {
        _id: payment._id,
        userId: {
          username: user?.username || 'unknown',
          email: user?.email || 'unknown'
        },
        planType: 'monthly',
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
    console.error('Approve premium payment error:', error);
    return NextResponse.json(
      { error: 'Failed to approve premium payment: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}