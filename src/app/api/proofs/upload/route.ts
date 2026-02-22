import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const taskId = formData.get('taskId') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size: 5MB' },
                { status: 400 }
            )
        }

        // Verify task belongs to user
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .select('id')
            .eq('id', taskId)
            .eq('user_id', user.id)
            .single()

        if (taskError || !task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg'
        const timestamp = Date.now()
        const filePath = `${user.id}/${taskId}-${timestamp}.${ext}`

        // Upload to Supabase Storage
        const buffer = Buffer.from(await file.arrayBuffer())

        const { error: uploadError } = await supabase.storage
            .from('quest-proofs')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            })

        if (uploadError) {
            console.error('[PROOF-UPLOAD] Upload failed:', uploadError)
            return NextResponse.json(
                { error: 'Failed to upload proof. Please try again.' },
                { status: 500 }
            )
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
            .from('quest-proofs')
            .getPublicUrl(filePath)

        return NextResponse.json({
            url: publicUrl.publicUrl,
            path: filePath,
        })
    } catch (error) {
        console.error('[PROOF-UPLOAD] Error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
