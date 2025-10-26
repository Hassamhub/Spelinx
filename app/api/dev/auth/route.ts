import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter per IP (resets on cold start)
const attempts: Record<string, { count: number; ts: number }> = {}
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 10

export async function POST(request: NextRequest) {
  try {
    // Obfuscated fallback key (server-side only)
    // Plain: SPELINX_DEV_UNLOCK_2025_SUPERKEY
    const hardcodedKey = String.fromCharCode(
      83,80,69,76,73,78,88,95,68,69,86,95,85,78,76,79,67,75,95,50,48,50,53,95,83,85,80,69,82,75,69,89
    )

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
    const now = Date.now()
    const rec = attempts[ip] || { count: 0, ts: now }
    if (now - rec.ts > WINDOW_MS) {
      rec.count = 0
      rec.ts = now
    }
    rec.count += 1
    attempts[ip] = rec
    if (rec.count > MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const { password } = await request.json()
    const expected = process.env.DEV_SAFETY_KEY || hardcodedKey

    if (!password || !expected || password !== expected) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const res = NextResponse.json({ success: true })
    res.cookies.set('dev_unlocked', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
