import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB, UserThemes, User } from '@/lib/mongodb';

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

    // Use MongoDB transaction for atomic operations
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Check if user owns the theme
        const userTheme = await UserThemes.findOne({ userId: decoded.id, themeId }).session(session);
        if (!userTheme) {
          throw new Error('Theme not purchased or not found');
        }

        // Set all user's themes to inactive
        await UserThemes.updateMany({ userId: decoded.id }, { active: false }, { session });

        // Set the selected theme to active
        userTheme.active = true;
        await userTheme.save({ session });

        // Update user's active theme
        await User.findByIdAndUpdate(decoded.id, { theme: themeId }, { session });
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      success: true,
      message: 'Theme applied successfully'
    });

  } catch (error: any) {
    console.error('Apply theme error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}