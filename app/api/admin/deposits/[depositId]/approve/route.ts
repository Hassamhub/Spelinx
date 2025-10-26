import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Transaction, User, Wallet } from '@/lib/mongodb';

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
    deposit.status = 'completed';
    deposit.verified = true;
    deposit.verifiedAt = new Date();
    deposit.verifiedBy = 'admin'; // You might want to get this from the authenticated user
    await deposit.save();

    // Update user's wallet balance
    await Wallet.findOneAndUpdate(
      { userId: deposit.userId },
      {
        $inc: { balance: deposit.amount, totalDeposits: deposit.amount },
        $push: { transactions: deposit._id }
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: 'Deposit approved successfully',
      deposit: {
        _id: deposit._id,
        userId: {
          username: 'admin', // Since we don't have the admin user populated
          email: 'admin@spelinx.com'
        },
        amount: deposit.amount,
        txnId: deposit._id,
        status: 'approved', // Map completed to approved
        screenshot: deposit.proofImage,
        notes: deposit.description,
        createdAt: deposit.createdAt,
        verifiedBy: { username: 'admin' },
        verifiedAt: deposit.verifiedAt,
      }
    });

  } catch (error: any) {
    console.error('Approve deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to approve deposit: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}