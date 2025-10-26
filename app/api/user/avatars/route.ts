import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB, User, StoreItem } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const ownedAvatarIds = user.ownedAvatars || []

    const avatars = await StoreItem.find({
      _id: { $in: ownedAvatarIds },
      category: 'avatars',
      isActive: true,
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      items: avatars.map((a: any) => ({
        _id: a._id,
        name: a.name,
        description: a.description,
        price: a.price,
        image: a.image,
        createdAt: a.createdAt,
      }))
    })
  } catch (error: any) {
    console.error('Fetch user avatars error:', error)
    return NextResponse.json({ error: 'Server error: ' + (error.message || 'Unknown error') }, { status: 500 })
  }
}
