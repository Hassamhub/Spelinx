import { NextRequest, NextResponse } from 'next/server';
import { connectDB, StoreItem } from '@/lib/mongodb';

export async function PUT(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    await connectDB();

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { name, description, price, originalPrice, discountPercentage, discountExpiry, category, image, isActive } = body;

    // Find and update the store item
    const updatedItem = await StoreItem.findByIdAndUpdate(
      params.itemId,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(originalPrice !== undefined && { originalPrice }),
        ...(discountPercentage !== undefined && { discountPercentage }),
        ...(discountExpiry !== undefined && { discountExpiry }),
        ...(category && { category }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: 'Store item not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Store item updated successfully',
      item: {
        _id: updatedItem._id,
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        originalPrice: updatedItem.originalPrice,
        discountPercentage: updatedItem.discountPercentage,
        discountExpiry: updatedItem.discountExpiry,
        category: updatedItem.category,
        image: updatedItem.image,
        isActive: updatedItem.isActive,
        createdAt: updatedItem.createdAt,
        updatedAt: updatedItem.updatedAt,
      }
    });

  } catch (error: any) {
    console.error('Update store item error:', error);
    return NextResponse.json(
      { error: 'Failed to update store item: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { itemId: string } }) {
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

    // Find and delete the store item
    const deletedItem = await StoreItem.findByIdAndDelete(params.itemId);

    if (!deletedItem) {
      return NextResponse.json({ error: 'Store item not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Store item deleted successfully',
      item: {
        _id: deletedItem._id,
        name: deletedItem.name,
        description: deletedItem.description,
        price: deletedItem.price,
        category: deletedItem.category,
        isActive: deletedItem.isActive,
        createdAt: deletedItem.createdAt,
      }
    });

  } catch (error: any) {
    console.error('Delete store item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete store item: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}