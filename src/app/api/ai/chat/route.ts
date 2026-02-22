import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkChatLimit } from '@/lib/rate-limiter'

export const maxDuration = 60

const LOCALE_TO_LANGUAGE: Record<string, string> = {
    en: 'English',
    bg: 'Bulgarian',
    es: 'Spanish',
    zh: 'Chinese',
    ja: 'Japanese',
}

export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL
    if (!webhookUrl) {
        return NextResponse.json({ error: 'AI chat not configured' }, { status: 503 })
    }

    let message: string
    let locale = 'en'

    try {
        const body = await request.json()
        message = body.message
        locale = body.locale || 'en'
        if (!message?.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const language = LOCALE_TO_LANGUAGE[locale] || 'English'

    // ── Fetch profile ──
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // ── Rate limiting ──
    const chatLimit = await checkChatLimit(user.id, profile.plan, supabase)
    if (!chatLimit.allowed) {
        return NextResponse.json(
            { error: `Daily chat limit reached (${chatLimit.current}/${chatLimit.limit}). Upgrade for unlimited.`, upgrade: true },
            { status: 429 }
        )
    }

    // ── Save user message to history ──
    await supabase.from('ai_chat_history').insert({
        user_id: user.id,
        role: 'user',
        content: message,
    })

    // ── Fetch context ──
    const { data: goals } = await supabase.from('goals').select('*').eq('user_id', user.id)
    const { data: recentTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    const { data: interests } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id)

    const requestPayload = {
        userId: user.id,
        message,
        personalityType: profile.personality_type,
        level: profile.level,
        aboutMe: profile.about_me || '',
        recentTasks: recentTasks || [],
        goals: goals || [],
        interests: interests?.map(i => i.interest) || [],
        timePreference: profile.time_preference || '',
        preferredTaskDuration: profile.preferred_task_duration || '',
        occupation: profile.occupation_type || '',
        workSchedule: profile.work_schedule || '',
        lifePhase: profile.life_phase || '',
        mainChallenge: profile.main_challenge || '',
        neurotransmitterScores: {
            dopamine: profile.dopamine_score ?? 0,
            acetylcholine: profile.acetylcholine_score ?? 0,
            gaba: profile.gaba_score ?? 0,
            serotonin: profile.serotonin_score ?? 0,
        },
        locale,
        language,
    }

    try {
        const webhookHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
        const webhookSecret = process.env.N8N_WEBHOOK_SECRET
        if (webhookSecret) {
            webhookHeaders['X-Webhook-Secret'] = webhookSecret
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 55_000)

        let response: Response
        try {
            response = await fetch(webhookUrl, {
                method: 'POST',
                headers: webhookHeaders,
                body: JSON.stringify(requestPayload),
                signal: controller.signal,
            })
        } catch (fetchErr) {
            clearTimeout(timeoutId)
            const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError'
            return NextResponse.json(
                { error: isTimeout ? 'Chat timed out. Please try again.' : 'Could not reach AI service.' },
                { status: 503 }
            )
        }
        clearTimeout(timeoutId)

        if (!response.ok) {
            return NextResponse.json({ error: 'AI service temporarily unavailable.' }, { status: 503 })
        }

        const responseText = await response.text()
        let reply = ''

        try {
            const raw = JSON.parse(responseText)

            if (Array.isArray(raw) && raw.length > 0) {
                const first = raw[0]
                const content = first?.message?.content || first?.output || first?.text || ''
                if (typeof content === 'string') {
                    try {
                        const parsed = JSON.parse(content)
                        reply = parsed.reply || content
                    } catch {
                        reply = content
                    }
                }
            } else if (typeof raw === 'object' && raw?.reply) {
                reply = raw.reply
            }
        } catch {
            reply = responseText
        }

        // ── Save assistant reply to history ──
        if (reply) {
            await supabase.from('ai_chat_history').insert({
                user_id: user.id,
                role: 'assistant',
                content: reply,
            })
        }

        return NextResponse.json({ reply })
    } catch (error) {
        console.error('[AI-CHAT] Error:', error)
        return NextResponse.json({ error: 'Failed to get AI response.' }, { status: 500 })
    }
}
