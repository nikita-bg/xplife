import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

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

        // Simple image upload without sharp (sharp may not be installed)
        const filename = `${randomUUID()}.webp`

        const { error } = await supabase.storage
            .from('blog-images')
            .upload(filename, rawBuffer, {
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
