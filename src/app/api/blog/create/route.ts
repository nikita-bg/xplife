import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

        const body = await request.json()
        const { title, slug, content, excerpt, cover_image_url, status } = body

        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: title, slug, content' },
                { status: 400 }
            )
        }

        const publishStatus = status || 'published'

        const { data, error } = await supabase
            .from('blog_posts')
            .upsert(
                {
                    title,
                    slug,
                    content,
                    excerpt: excerpt || null,
                    cover_image_url: cover_image_url || null,
                    status: publishStatus,
                    published_at: publishStatus === 'published' ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'slug' }
            )
            .select()
            .single()

        if (error) {
            console.error('Blog create error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, post: data })
    } catch (err) {
        console.error('Blog API error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
