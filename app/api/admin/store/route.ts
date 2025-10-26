import { NextRequest, NextResponse } from 'next/server';
import { connectDB, StoreItem } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category'); // skins, themes, avatars, premium
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get store items
    const items = await StoreItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StoreItem.countDocuments(filter);

    // Transform data to match frontend expectations exactly
    const formattedItems = items.map(item => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      originalPrice: item.originalPrice || undefined,
      discountPercentage: item.discountPercentage || undefined,
      discountExpiry: item.discountExpiry || undefined,
      category: item.category,
      image: item.image || undefined,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error: any) {
    console.error('Admin store fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store items: ' + (error.message || 'Unknown error') },
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
    const { name, description, price, originalPrice, discountPercentage, discountExpiry, category, image, isActive } = body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Name, description, price, and category are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['skins', 'themes', 'avatars', 'premium'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: skins, themes, avatars, premium' },
        { status: 400 }
      );
    }

    // Create new store item
    const newItem = new StoreItem({
      name,
      description,
      price,
      originalPrice,
      discountPercentage,
      discountExpiry,
      category,
      image,
      isActive: isActive !== undefined ? isActive : true
    });

    await newItem.save();

    return NextResponse.json({
      message: 'Store item created successfully',
      item: {
        _id: newItem._id,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        originalPrice: newItem.originalPrice,
        discountPercentage: newItem.discountPercentage,
        discountExpiry: newItem.discountExpiry,
        category: newItem.category,
        image: newItem.image,
        isActive: newItem.isActive,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt,
      }
    });

  } catch (error: any) {
    console.error('Create store item error:', error);
    return NextResponse.json(
      { error: 'Failed to create store item: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}