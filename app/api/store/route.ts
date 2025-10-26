import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, StoreItem, Transaction, User, Wallet } from '@/lib/mongodb';

// Premium subscription plans
const premiumPlans = {
  monthly: { cost: 499, name: "Monthly Plan", period: "30 days", savings: "0%", type: "monthly" },
  quarterly: { cost: 1200, name: "Quarterly Plan", period: "90 days", savings: "Save 10%", type: "quarterly" },
  semiAnnual: { cost: 2200, name: "Semi-Annual Plan", period: "180 days", savings: "Save 15%", type: "semiAnnual" },
  yearly: { cost: 3999, name: "Yearly Plan", period: "365 days", savings: "Save 20%", type: "yearly" },
  lifetime: { cost: 10000, name: "Lifetime Plan", period: "Lifetime", savings: "Save 60%", type: "lifetime" }
};


export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Build query
    const query: any = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    // Get store items
    let items = await StoreItem.find(query).sort({ createdAt: -1 });

    // If premium category and no items, add default premium plans
    if (category === 'premium' || category === 'all') {
      const premiumItems = Object.entries(premiumPlans).map(([key, plan]) => ({
        _id: `premium_${key}`,
        name: plan.name,
        description: `Premium subscription - ${plan.period}`,
        price: plan.cost,
        originalPrice: key === 'yearly' ? 5000 : key === 'lifetime' ? 25000 : plan.cost,
        discountPercentage: key === 'yearly' ? 20 : key === 'lifetime' ? 60 : 0,
        category: 'premium',
        image: null,
        isPremium: true,
        period: plan.period,
        savings: plan.savings,
        type: plan.type
      }));

      if (category === 'premium') {
        items = premiumItems;
      } else {
        items = [...premiumItems, ...items];
      }
    }

    return NextResponse.json({
      success: true,
      items: items.map(item => ({
        _id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        originalPrice: item.originalPrice,
        discountPercentage: item.discountPercentage,
        discountExpiry: item.discountExpiry,
        category: item.category,
        image: item.image
      }))
    });

  } catch (error: any) {
    console.error('Store API error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from header
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;

    const { itemId, paymentMethod } = await request.json();

    if (!itemId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Item ID and payment method are required' },
        { status: 400 }
      );
    }

    // Check if it's a premium item
    let isPremiumItem = false;
    let premiumType = '';

    if (itemId.startsWith('premium_')) {
      isPremiumItem = true;
      premiumType = itemId.split('_')[1];
    } else {
      const item = await StoreItem.findById(itemId);
      if (!item || !item.isActive) {
        return NextResponse.json({ error: 'Item not found or inactive' }, { status: 404 });
      }
    }

    let finalAmount, itemName, itemCategory, itemDoc: any = null;

    if (isPremiumItem) {
      const plan = premiumPlans[premiumType as keyof typeof premiumPlans];
      if (!plan) {
        return NextResponse.json({ error: 'Invalid premium type' }, { status: 400 });
      }

      finalAmount = plan.cost;
      itemName = plan.name;
      itemCategory = 'premium';
    } else {
      // Regular store item
      const item = await StoreItem.findById(itemId);
      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      finalAmount = item.price;
      itemName = item.name;
      itemCategory = item.category;
      itemDoc = item;
    }

    // Generate unique transaction ID
    const transactionId = isPremiumItem ? `PREMIUM_${Date.now()}_${decoded.id}_${premiumType}` : `STORE_${Date.now()}_${decoded.id}_${itemId}`;

    // UPI details from environment
    const upiId = process.env.FAMPAY_UPI_ID || "merchant@fam";
    const merchantName = process.env.MERCHANT_NAME || "SPELINX Gaming";

    // Create UPI URI
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(`${itemName} - SPELINX ${isPremiumItem ? 'Premium' : 'Store'}`)}`;

    // Create payment details
    const paymentDetails = {
      transactionId,
      userId: decoded.id,
      itemId: isPremiumItem ? `premium_${premiumType}` : itemId,
      amount: finalAmount,
      upiId,
      merchantName,
      qrData: upiUri,
      itemName,
      category: itemCategory,
      type: isPremiumItem ? premiumType : undefined,
      status: 'pending',
      createdAt: new Date(),
      notes: `${isPremiumItem ? 'Premium' : 'Store item'} ${itemName} payment - ₹${finalAmount}`
    };

    console.log(`${isPremiumItem ? 'Premium' : 'Store'} payment initiated:`, {
      userId: decoded.id,
      itemId: isPremiumItem ? `premium_${premiumType}` : itemId,
      amount: finalAmount,
      transactionId
    });

    // Create or upsert a Transaction so admin can approve it later
    const txn = new Transaction({
      userId: decoded.id,
      transactionId,
      type: 'store_payment',
      amount: finalAmount,
      description: isPremiumItem
        ? `Premium plan ${itemName} payment - ₹${finalAmount}`
        : `${itemCategory === 'themes' ? 'Theme' : 'Store'} item ${itemName} payment - ₹${finalAmount}`,
      status: 'pending',
    });
    await txn.save();

    return NextResponse.json({
      success: true,
      paymentDetails,
      message: "Payment initiated successfully. Please complete the UPI transaction and upload proof.",
      instructions: "1. Scan QR code or use UPI ID to pay. 2. Upload payment proof image. 3. Wait for admin approval. 4. Item will be unlocked."
    });

  } catch (error: any) {
    console.error('Store purchase error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}