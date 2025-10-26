import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file = data.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `store_${Date.now()}_${file.name}`
    const uploadDir = path.join(process.cwd(), 'public', 'store-images')

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true })

    // Save file
    await writeFile(path.join(uploadDir, filename), buffer)

    // Return URL
    const url = `/store-images/${filename}`

    return NextResponse.json({ success: true, url })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}