import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, Theme } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get themes
    const themes = await Theme.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Theme.countDocuments();

    return NextResponse.json({
      themes: themes.map(theme => ({
        _id: theme._id,
        name: theme.name,
        description: theme.description,
        previewUrl: theme.previewUrl,
        price: theme.price,
        scope: theme.scope,
        isActive: theme.isActive,
        createdAt: theme.createdAt,
        updatedAt: theme.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error: any) {
    console.error('Admin themes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication (disabled for development)
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized - Missing or invalid token' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const { name, description, price, scope, previewUrl, themeFile } = body;

    // Validate required fields
    if (!name || !description || !price || !themeFile) {
      return NextResponse.json(
        { error: 'Name, description, price, and theme file are required' },
        { status: 400 }
      );
    }

    // Validate scope
    const validScopes = ['full_site', 'games_only'];
    if (scope && !validScopes.includes(scope)) {
      return NextResponse.json(
        { error: 'Invalid scope. Must be one of: full_site, games_only' },
        { status: 400 }
      );
    }

    // Create new theme
    const newTheme = new Theme({
      name,
      description,
      price,
      scope: scope || 'full_site',
      previewUrl,
      themeFile,
      isActive: true
    });

    await newTheme.save();

    return NextResponse.json({
      message: 'Theme created successfully',
      theme: {
        _id: newTheme._id,
        name: newTheme.name,
        description: newTheme.description,
        price: newTheme.price,
        scope: newTheme.scope,
        previewUrl: newTheme.previewUrl,
        isActive: newTheme.isActive,
        createdAt: newTheme.createdAt,
        updatedAt: newTheme.updatedAt,
      }
    });

  } catch (error: any) {
    console.error('Create theme error:', error);
    return NextResponse.json(
      { error: 'Failed to create theme: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}