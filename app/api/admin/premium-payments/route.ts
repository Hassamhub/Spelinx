import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Transaction, User } from '@/lib/mongodb';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // pending, completed, failed
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = { type: 'premium_payment' };

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get premium payments with user information
    const payments = await Transaction.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    // Transform the data to match frontend expectations
    const formattedPayments = payments.map((payment: any) => ({
      _id: payment._id,
      userId: {
        username: payment.userId.username,
        email: payment.userId.email
      },
      planType: 'monthly', // Extract from description or use default
      amount: payment.amount,
      transactionId: payment._id,
      status: payment.status === 'completed' ? 'approved' :
             payment.status === 'failed' ? 'rejected' : 'submitted',
      paymentProof: payment.proofImage,
      adminNotes: payment.description,
      submittedAt: payment.createdAt,
      reviewedBy: payment.verifiedBy ? { username: payment.verifiedBy } : undefined,
      reviewedAt: payment.verifiedAt,
    }));

    return NextResponse.json({
      payments: formattedPayments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error: any) {
    console.error('Admin premium payments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch premium payments: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}