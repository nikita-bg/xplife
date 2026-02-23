'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface ChatMessage {
    id?: string
    role: 'user' | 'assistant'
    content: string
}

export default function ChatWidget() {
    const router = useRouter()
    const pathname = usePathname()
    const locale = pathname.split('/')[1] || 'en'
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [remaining, setRemaining] = useState<number | null>(null)
    const [loaded, setLoaded] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => { scrollToBottom() }, [messages])

    // Get user ID
    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)
        }
        getUser()
    }, [])

    const loadMessages = useCallback(async () => {
        if (!userId) return
        const supabase = createClient()
        const { data } = await supabase
            .from('ai_chat_history')
            .select('id, role, content, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) setMessages(data.reverse() as ChatMessage[])

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const { count } = await supabase
            .from('ai_chat_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('role', 'user')
            .gte('created_at', todayStart.toISOString())

        setRemaining(50 - (count ?? 0))
        setLoaded(true)
    }, [userId])

    useEffect(() => {
        if (open && !loaded && userId) loadMessages()
    }, [open, loaded, userId, loadMessages])

    const handleSend = async () => {
        const trimmed = input.trim()
        if (!trimmed || sending) return

        setMessages(prev => [...prev, { role: 'user', content: trimmed }])
        setInput('')
        setSending(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, locale }),
            })
            const data = await res.json()

            if (!res.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Something went wrong.' }])
                return
            }

            let replyContent = data.reply || 'No response received.'
            if (data.tasksCreated > 0) {
                replyContent += `\n\n✅ ${data.tasksCreated} task(s) added to your quests!`
                router.refresh()
            }

            setMessages(prev => [...prev, { role: 'assistant', content: replyContent }])
            if (data.remainingMessages !== undefined) setRemaining(data.remainingMessages)
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to send message. Please try again.' }])
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-24 md:bottom-8 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-background shadow-[0_0_30px_rgba(0,245,255,0.3)] transition-transform hover:scale-105 active:scale-95"
                aria-label={open ? 'Close chat' : 'Open chat'}
            >
                {open ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Chat window */}
            {open && (
                <div className="fixed bottom-24 left-3 right-3 z-50 flex h-[calc(100dvh-8rem)] max-h-[450px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0C1021]/95 backdrop-blur-xl shadow-[0_0_60px_rgba(0,245,255,0.08)] sm:left-auto sm:right-6 sm:w-[370px]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 bg-[#0C1021]/90 px-5 py-3">
                        <div>
                            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">AI Quest Advisor</h3>
                            {remaining !== null && (
                                <p className="font-data text-[10px] text-ghost/40 tracking-wider">{remaining}/50 messages left today</p>
                            )}
                        </div>
                        <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <X size={14} className="text-ghost/50" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                        {messages.length === 0 && (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-center font-sans text-sm text-ghost/40">Ask me anything about your quests and goals!</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-accent/15 text-accent border border-accent/20'
                                        : 'bg-white/5 text-ghost/80 border border-white/5'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl bg-white/5 border border-white/5 px-4 py-2.5 text-sm text-ghost/40 flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 border-t border-white/5 bg-[#0C1021]/90 px-3 py-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-ghost placeholder:text-ghost/20 focus:outline-none focus:border-accent/30 transition-colors"
                            disabled={sending || remaining === 0}
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !input.trim() || remaining === 0}
                            className="h-10 w-10 shrink-0 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors disabled:opacity-30"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
