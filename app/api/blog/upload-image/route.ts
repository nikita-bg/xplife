import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-api-key')
    if (authHeader !== process.env.BLOG_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawBuffer = Buffer.from(await request.arrayBuffer())

    // Convert to WebP with quality 80, max width 1200px
    const webpBuffer = await sharp(rawBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    const filename = `${randomUUID()}.webp`

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(filename, webpBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      console.error('Image upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filename)

    // Return in WordPress-compatible format so n8n workflow needs minimal changes
    return NextResponse.json({
      guid: { rendered: urlData.publicUrl },
      source_url: urlData.publicUrl,
    })
  } catch (err) {
    console.error('Image upload API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
