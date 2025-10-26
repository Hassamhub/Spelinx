import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Transaction, User } from '@/lib/mongodb';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // pending, completed, failed
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = { type: 'deposit' };

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get deposits with user information
    const deposits = await Transaction.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    // Transform the data to match frontend expectations
    const formattedDeposits = deposits.map((deposit: any) => ({
      _id: deposit._id,
      userId: {
        username: deposit.userId.username,
        email: deposit.userId.email
      },
      amount: deposit.amount,
      txnId: deposit._id, // Use deposit ID as transaction ID for now
      status: deposit.status === 'completed' ? 'approved' :
             deposit.status === 'failed' ? 'rejected' : 'pending',
      screenshot: deposit.proofImage, // Map proofImage to screenshot
      notes: deposit.description, // Map description to notes
      createdAt: deposit.createdAt,
      verifiedBy: deposit.verifiedBy ? { username: deposit.verifiedBy } : undefined,
      verifiedAt: deposit.verifiedAt,
    }));

    return NextResponse.json({
      deposits: formattedDeposits,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error: any) {
    console.error('Admin deposits fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deposits: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}