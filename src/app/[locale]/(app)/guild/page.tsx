'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Users, Crown, Swords, Copy, Check, LogIn } from 'lucide-react';
import gsap from 'gsap';
import { createClient } from '@/lib/supabase/client';
import GuildChat from '@/components/guild/GuildChat';
import GuildQuestCard from '@/components/guild/GuildQuestCard';
import CreateGuildModal from '@/components/guild/CreateGuildModal';

interface GuildData {
    id: string;
    name: string;
    description: string | null;
    member_count: number;
    total_xp: number;
    created_at: string;
    userRole?: string;
}

interface MemberData {
    user_id: string;
    role: string;
    display_name?: string | null;
    avatar_url?: string | null;
    level?: number;
    total_xp?: number;
}

interface QuestData {
    id: string;
    title: string;
    description: string | null;
    category: string;
    difficulty: string;
    xp_reward: number;
    target_contributions: number;
    current_contributions: number;
    status: string;
}

export default function GuildPage() {
    const [guilds, setGuilds] = useState<GuildData[]>([]);
    const [activeGuild, setActiveGuild] = useState<GuildData | null>(null);
    const [members, setMembers] = useState<MemberData[]>([]);
    const [quests, setQuests] = useState<QuestData[]>([]);
    const [userRole, setUserRole] = useState('member');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [copiedInvite, setCopiedInvite] = useState(false);
    const [contributingQuest, setContributingQuest] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState('');

    // Fetch guilds
    useEffect(() => {
        const fetchGuilds = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/guilds');
                if (res.ok) {
                    const data = await res.json();
                    setGuilds(data.guilds || []);
                    if (data.guilds?.length > 0) {
                        loadGuildDetails(data.guilds[0].id);
                    }
                }
            } catch { /* silent */ }
            setLoading(false);
        };
        fetchGuilds();

        // Get current user id
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setCurrentUserId(data.user.id);
        });
    }, []);

    useEffect(() => {
        gsap.from('.guild-card', { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' });
    }, [activeGuild]);

    const loadGuildDetails = async (guildId: string) => {
        const res = await fetch(`/api/guilds/${guildId}`);
        if (res.ok) {
            const data = await res.json();
            setActiveGuild(data.guild);
            setMembers(data.members || []);
            setQuests(data.quests || []);
            setUserRole(data.userRole || 'member');
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim() || joining) return;
        setJoining(true);

        try {
            // We need a guild id – try to find invite first
            const res = await fetch(`/api/guilds/join-by-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: joinCode.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                loadGuildDetails(data.guildId);
                setJoinCode('');
                // Refresh guild list
                const listRes = await fetch('/api/guilds');
                if (listRes.ok) {
                    const listData = await listRes.json();
                    setGuilds(listData.guilds || []);
                }
            }
        } catch { /* silent */ }
        setJoining(false);
    };

    const generateInvite = async () => {
        if (!activeGuild) return;
        const res = await fetch(`/api/guilds/${activeGuild.id}/invite`, { method: 'POST' });
        if (res.ok) {
            const data = await res.json();
            setInviteCode(data.inviteCode);
        }
    };

    const copyInvite = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopiedInvite(true);
        setTimeout(() => setCopiedInvite(false), 2000);
    };

    const handleContribute = async (questId: string) => {
        if (!activeGuild || contributingQuest) return;
        setContributingQuest(questId);

        try {
            const res = await fetch(`/api/guilds/${activeGuild.id}/quests`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId }),
            });

            if (res.ok) {
                // Refresh quests
                const questRes = await fetch(`/api/guilds/${activeGuild.id}/quests`);
                if (questRes.ok) {
                    const data = await questRes.json();
                    setQuests(data.quests || []);
                }
            }
        } catch { /* silent */ }
        setContributingQuest(null);
    };

    // ── No Guild State ──
    if (!loading && guilds.length === 0) {
        return (
            <>
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="guild-card bg-[#0C1021] rounded-[2rem] border border-white/5 p-8 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto mb-4">
                            <Shield size={40} className="text-tertiary" />
                        </div>
                        <h2 className="font-heading text-2xl font-bold uppercase tracking-wider mb-2">Join a Guild</h2>
                        <p className="font-sans text-sm text-ghost/50 mb-6">
                            Unite with other heroes. Complete guild quests together and climb the ranks.
                        </p>

                        <button
                            onClick={() => setShowCreate(true)}
                            className="btn-magnetic w-full py-4 rounded-2xl bg-tertiary/10 border border-tertiary/30 text-tertiary font-heading text-sm uppercase tracking-wider hover:bg-tertiary/20 transition-all mb-4 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Create Your Guild
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#0C1021] px-4 font-data text-[10px] text-ghost/30 tracking-wider">OR</span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <input
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                placeholder="Enter invite code..."
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-data text-sm text-ghost placeholder:text-ghost/30 focus:outline-none focus:border-tertiary/30 transition-colors"
                            />
                            <button
                                onClick={handleJoin}
                                disabled={!joinCode.trim() || joining}
                                className="px-6 rounded-xl bg-accent/10 border border-accent/20 text-accent font-data text-xs uppercase tracking-wider hover:bg-accent/20 transition-colors disabled:opacity-30 flex items-center gap-2"
                            >
                                <LogIn size={14} /> Join
                            </button>
                        </div>
                    </div>
                </div>

                <CreateGuildModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreated={(guild) => {
                        setShowCreate(false);
                        setGuilds([{ ...guild, description: null, member_count: 1, total_xp: 0, created_at: new Date().toISOString(), userRole: 'owner' }]);
                        loadGuildDetails(guild.id);
                    }}
                />
            </>
        );
    }

    // ── Loading State ──
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-tertiary/30 border-t-tertiary rounded-full animate-spin" />
            </div>
        );
    }

    // ── Guild Dashboard ──
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Guild Info + Members */}
            <div className="guild-card lg:col-span-3 space-y-6">
                {/* Guild Info */}
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto mb-3">
                        <Shield size={32} className="text-tertiary" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-white mb-1">{activeGuild?.name}</h3>
                    {activeGuild?.description && (
                        <p className="font-sans text-xs text-ghost/40 mb-3">{activeGuild.description}</p>
                    )}
                    <div className="flex justify-around mt-4">
                        <div className="text-center">
                            <div className="font-heading text-lg text-accent font-bold">{activeGuild?.member_count || 0}</div>
                            <div className="font-data text-[10px] text-ghost/40 tracking-wider">MEMBERS</div>
                        </div>
                        <div className="text-center">
                            <div className="font-heading text-lg text-accent-secondary font-bold">{(activeGuild?.total_xp || 0).toLocaleString()}</div>
                            <div className="font-data text-[10px] text-ghost/40 tracking-wider">TOTAL XP</div>
                        </div>
                    </div>
                </div>

                {/* Members */}
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5">
                    <div className="font-heading text-xs uppercase tracking-widest text-ghost/40 mb-3 flex items-center gap-2">
                        <Users size={12} /> Members
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {members.map(m => (
                            <div key={m.user_id} className="flex items-center gap-2 py-1">
                                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    {m.role === 'owner' ? <Crown size={10} className="text-accent-secondary" /> : <Users size={10} className="text-ghost/30" />}
                                </div>
                                <span className="font-sans text-xs text-ghost/70 truncate">{m.display_name || 'Hero'}</span>
                                <span className="font-data text-[9px] text-ghost/25 tracking-wider ml-auto">{m.role.toUpperCase()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invite */}
                {['owner', 'admin'].includes(userRole) && (
                    <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5">
                        <div className="font-heading text-xs uppercase tracking-widest text-ghost/40 mb-3">Invite</div>
                        {inviteCode ? (
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 font-data text-xs text-accent tracking-wider">
                                    {inviteCode}
                                </div>
                                <button onClick={copyInvite} className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors">
                                    {copiedInvite ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        ) : (
                            <button onClick={generateInvite} className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-ghost/50 font-data text-xs uppercase tracking-wider hover:bg-white/[0.06] transition-all">
                                Generate Invite Code
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Center: Guild Quests */}
            <div className="guild-card lg:col-span-5">
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading font-bold text-xl uppercase tracking-wider flex items-center gap-2">
                            <Swords size={20} className="text-tertiary" /> Guild Quests
                        </h2>
                        <div className="font-data text-[10px] text-ghost/30 tracking-wider">
                            {quests.filter(q => q.status === 'active').length} ACTIVE
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {quests.length > 0 ? (
                            quests.map(q => (
                                <GuildQuestCard
                                    key={q.id}
                                    quest={q}
                                    onContribute={handleContribute}
                                    contributing={contributingQuest === q.id}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Swords size={40} className="mx-auto text-tertiary/30 mb-4" />
                                <p className="font-sans text-ghost/40">No guild quests yet</p>
                                {['owner', 'admin'].includes(userRole) && (
                                    <p className="font-data text-xs text-ghost/25 mt-1">Create one to rally your guild!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Chat */}
            <div className="guild-card lg:col-span-4">
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-heading text-sm uppercase tracking-wider text-ghost/60">Guild Chat</h3>
                    </div>
                    {activeGuild && currentUserId && (
                        <GuildChat guildId={activeGuild.id} currentUserId={currentUserId} />
                    )}
                </div>
            </div>
        </div>
    );
}
