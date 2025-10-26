import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, Theme } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check admin access
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const scope = formData.get('scope') as 'full_site' | 'games_only';
    const previewImage = formData.get('previewImage') as File;
    const themeFile = formData.get('themeFile') as File;

    if (!name || !description || !price || !scope || !themeFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate themeFile JSON
    let themeJson;
    try {
      const themeText = await themeFile.text();
      themeJson = JSON.parse(themeText);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON in theme file' }, { status: 400 });
    }

    // Validate JSON keys (basic check)
    const requiredKeys = ['colors', 'fonts'];
    for (const key of requiredKeys) {
      if (!themeJson[key]) {
        return NextResponse.json({ error: `Missing required key: ${key}` }, { status: 400 });
      }
    }

    // Save preview image if provided
    let previewUrl = '';
    if (previewImage) {
      // In a real app, upload to a storage service like S3
      previewUrl = `/assets/themes/${previewImage.name}`;
      // For now, assume it's saved
    }

    // Create theme
    const theme = new Theme({
      name,
      description,
      previewUrl,
      themeFile: themeJson,
      price,
      scope,
      isActive: true
    });

    await theme.save();

    return NextResponse.json({
      success: true,
      message: 'Theme uploaded successfully',
      theme
    });

  } catch (error: any) {
    console.error('Theme upload error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}