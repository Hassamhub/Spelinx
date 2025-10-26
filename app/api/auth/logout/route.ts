import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  // Expire the token cookie immediately
  const response = NextResponse.json({ success: true })
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  })
  return response
}
