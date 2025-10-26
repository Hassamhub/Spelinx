import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Transaction, Theme, UserThemes, ThemeSale } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Basic admin check using JWT from Authorization header
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any
    } catch (_) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }
    if (!decoded?.isAdmin) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const { transactionId, userId, themeId } = await request.json()

    if (!transactionId && (!userId || !themeId)) {
      return NextResponse.json({ success: false, message: 'Missing data' }, { status: 400 })
    }

    // Find transaction by provided transactionId (prefer string field), fallback to _id
    let txn = null as any
    if (transactionId) {
      txn = await Transaction.findOne({ transactionId })
      if (!txn) {
        // fallback to _id
        try {
          txn = await Transaction.findById(transactionId)
        } catch (_) {
          /* ignore */
        }
      }
    } else {
      // Fallback search by user+theme where description contains theme name and type is store_payment
      txn = await Transaction.findOne({ userId, type: 'store_payment', status: { $in: ['pending', 'completed'] } }).sort({ createdAt: -1 })
    }

    if (!txn) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 })
    }

    // If already completed, ensure sales and ownership are consistent then return success idempotently
    if (txn.status === 'completed') {
      await ensureOwnershipAndSale(txn)
      return NextResponse.json({ success: true, message: 'Already approved' })
    }

    // For pending transactions, reconcile theme and assign ownership
    await ensureOwnershipAndSale(txn)

    // Mark transaction as completed/verified
    txn.status = 'completed'
    txn.verified = true
    txn.verifiedAt = new Date()
    txn.verifiedBy = 'admin'
    await txn.save()

    return NextResponse.json({ success: true, message: 'Theme approved successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server error: ' + (error.message || 'Unknown error') }, { status: 500 })
  }
}

async function ensureOwnershipAndSale(txn: any) {
  // Determine theme from themeId passed in description, or by parsing description pattern "Theme <name> purchase"
  let theme: any = null

  // If transaction contains a description with Theme name
  if (txn.description && typeof txn.description === 'string') {
    const name = txn.description.match(/Theme (.+) purchase/)?.[1]
    if (name) {
      theme = await Theme.findOne({ name })
    }
  }

  // If still not found, try to recover from an existing ThemeSale by transactionId
  if (!theme) {
    const existingSale = await ThemeSale.findOne({ transactionId: txn.transactionId || String(txn._id) })
    if (existingSale) {
      theme = await Theme.findById(existingSale.themeId)
    }
  }

  if (!theme) {
    // As a last resort, do nothing silently; admin route remains idempotent
    return
  }

  // Assign theme to user if not owned
  const owned = await UserThemes.findOne({ userId: txn.userId, themeId: theme._id })
  if (!owned) {
    const ut = new UserThemes({ userId: txn.userId, themeId: theme._id, active: false, purchasedAt: new Date() })
    await ut.save()
  }

  // Upsert ThemeSale by transactionId string (fallback to _id)
  const txnKey = txn.transactionId || String(txn._id)
  const existing = await ThemeSale.findOne({ transactionId: txnKey })
  if (!existing) {
    const sale = new ThemeSale({
      userId: txn.userId,
      themeId: theme._id,
      amount: txn.amount,
      transactionId: txnKey
    })
    await sale.save()
  }
}
