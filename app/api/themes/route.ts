import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, Theme, UserThemes, User } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get themes
    const themes = await Theme.find({ isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      themes: themes.map(theme => ({
        _id: theme._id,
        name: theme.name,
        description: theme.description,
        previewUrl: theme.previewUrl,
        price: theme.price,
        scope: theme.scope,
        themeFile: theme.themeFile,
        createdAt: theme.createdAt,
      }))
    });

  } catch (error: any) {
    console.error('Themes fetch error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}