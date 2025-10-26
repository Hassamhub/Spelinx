
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import jwt from 'jsonwebtoken';
import { connectDB, Transaction } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from header
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');

    // Build query
    const query: any = { userId: decoded.id };
    if (type && type !== 'all') {
      query.type = type;
    }

    // Get transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      success: true,
      transactions: transactions.map(t => ({
        _id: t._id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        paymentProof: t.paymentProof,
        proofImage: t.proofImage,
        submittedAt: t.submittedAt,
        verified: t.verified,
        verifiedAt: t.verifiedAt,
        verifiedBy: t.verifiedBy,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        transactionId: t.transactionId || t._id.toString()
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error: any) {
    console.error('Payment transactions error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
