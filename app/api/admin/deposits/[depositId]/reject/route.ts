import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Transaction } from '@/lib/mongodb';

export async function POST(request: NextRequest, { params }: { params: { depositId: string } }) {
  try {
    await connectDB();

    const { notes } = await request.json();

    // Find the deposit transaction
    const deposit = await Transaction.findById(params.depositId);

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    // Check if it's actually a deposit
    if (deposit.type !== 'deposit') {
      return NextResponse.json({ error: 'Transaction is not a deposit' }, { status: 400 });
    }

    // Check if already processed
    if (deposit.status !== 'pending') {
      return NextResponse.json({ error: 'Deposit has already been processed' }, { status: 400 });
    }

    // Update transaction status
    deposit.status = 'failed';
    deposit.verified = true;
    deposit.verifiedAt = new Date();
    deposit.verifiedBy = 'admin'; // You might want to get this from the authenticated user
    await deposit.save();

    return NextResponse.json({
      message: 'Deposit rejected successfully',
      deposit: {
        _id: deposit._id,
        userId: {
          username: 'admin',
          email: 'admin@spelinx.com'
        },
        amount: deposit.amount,
        txnId: deposit._id,
        status: 'rejected', // Map failed to rejected
        screenshot: deposit.proofImage,
        notes: deposit.description,
        createdAt: deposit.createdAt,
        verifiedBy: { username: 'admin' },
        verifiedAt: deposit.verifiedAt,
      }
    });

  } catch (error: any) {
    console.error('Reject deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to reject deposit: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}