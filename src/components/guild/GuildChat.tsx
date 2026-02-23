'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ChatMessage {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    display_name?: string | null;
    avatar_url?: string | null;
}

interface MemberData {
    user_id: string;
    display_name?: string | null;
    avatar_url?: string | null;
}

interface GuildChatProps {
    guildId: string;
    currentUserId: string;
    members?: MemberData[];
}

export default function GuildChat({ guildId, currentUserId, members = [] }: GuildChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            const res = await fetch(`/api/guilds/${guildId}/chat`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
                setTimeout(scrollToBottom, 100);
            }
        };
        fetchMessages();
    }, [guildId, scrollToBottom]);

    // Subscribe to Realtime
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel(`guild-chat:${guildId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'guild_chat_messages',
                    filter: `guild_id=eq.${guildId}`,
                },
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    // Enrich with display_name from members prop
                    const member = members.find(m => m.user_id === newMsg.user_id);
                    const enriched = {
                        ...newMsg,
                        display_name: newMsg.display_name ?? member?.display_name ?? null,
                        avatar_url: newMsg.avatar_url ?? member?.avatar_url ?? null,
                    };
                    setMessages(prev => [...prev, enriched]);
                    setTimeout(scrollToBottom, 100);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [guildId, scrollToBottom]);

    const sendMessage = async () => {
        if (!input.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/guilds/${guildId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: input.trim() }),
            });

            if (res.ok) {
                setInput('');
            }
        } catch {
            // Silent fail
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto space-y-3 p-4 max-h-[400px]">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="font-data text-xs text-ghost/30 tracking-wider">NO MESSAGES YET</p>
                        <p className="font-sans text-sm text-ghost/40 mt-2">Be the first to say something!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.user_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    {msg.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={msg.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={12} className="text-ghost/30" />
                                    )}
                                </div>
                                <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-data text-[10px] text-accent/60 tracking-wider">
                                            {msg.display_name || 'Hero'}
                                        </span>
                                        <span className="font-data text-[9px] text-ghost/20">
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                    <div className={`rounded-xl px-3 py-2 text-sm font-sans ${isOwn ? 'bg-accent/10 text-ghost border border-accent/20' : 'bg-white/[0.03] text-ghost/80 border border-white/5'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        maxLength={1000}
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 font-sans text-sm text-ghost placeholder:text-ghost/30 focus:outline-none focus:border-accent/30 transition-colors"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || sending}
                        className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors disabled:opacity-30"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
