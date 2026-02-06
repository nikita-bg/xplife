'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send } from 'lucide-react'

interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface ChatWidgetProps {
  userId: string
}

export function ChatWidget({ userId }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('ai_chat_history')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setMessages(data.reverse() as ChatMessage[])
    }

    // Get remaining messages count
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
    if (open && !loaded) {
      loadMessages()
    }
  }, [open, loaded, loadMessages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: data.error || 'Something went wrong.',
        }
        setMessages((prev) => [...prev, errorMsg])
        if (data.remainingMessages !== undefined) {
          setRemaining(data.remainingMessages)
        }
        return
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.reply,
      }
      setMessages((prev) => [...prev, assistantMsg])

      if (data.remainingMessages !== undefined) {
        setRemaining(data.remainingMessages)
      }
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Failed to send message. Please try again.',
      }
      setMessages((prev) => [...prev, errorMsg])
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[450px] w-[300px] flex-col overflow-hidden rounded-2xl border border-border bg-background/80 shadow-2xl backdrop-blur-xl sm:w-[350px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-background/90 px-4 py-3">
            <div>
              <h3 className="font-display text-sm font-bold text-foreground">AI Quest Advisor</h3>
              {remaining !== null && (
                <p className="text-xs text-muted-foreground">{remaining}/50 messages left today</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  Ask me anything about your quests and goals!
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="mb-2 flex justify-start">
                <div className="max-w-[85%] rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border bg-background/90 px-3 py-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-background/50 text-sm"
              disabled={sending || remaining === 0}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={sending || !input.trim() || remaining === 0}
              className="h-9 w-9 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
