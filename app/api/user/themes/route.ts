import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'

import jwt from 'jsonwebtoken';
import { connectDB, UserThemes, Theme } from '@/lib/mongodb';

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

    // Get user's themes
    const userThemes = await UserThemes.find({ userId: decoded.id })
      .populate('themeId')
      .sort({ purchasedAt: -1 });

    const themes = userThemes.map(ut => ({
      _id: ut.themeId._id,
      name: ut.themeId.name,
      description: ut.themeId.description,
      previewUrl: ut.themeId.previewUrl,
      themeFile: ut.themeId.themeFile,
      scope: ut.themeId.scope,
      active: ut.active,
      purchasedAt: ut.purchasedAt,
      createdAt: ut.themeId.createdAt,
    }));

    return NextResponse.json({
      success: true,
      themes
    });

  } catch (error: any) {
    console.error('User themes fetch error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}