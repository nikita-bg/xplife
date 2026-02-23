'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Users, Crown, Star, Swords, Copy, Check, LogIn, LogOut, Trash2, UserMinus, UserCheck } from 'lucide-react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import GuildChat from '@/components/guild/GuildChat';
import GuildQuestCard from '@/components/guild/GuildQuestCard';
import CreateGuildModal from '@/components/guild/CreateGuildModal';
import { EMBLEMS, getEmblemIcon } from '@/components/guild/GuildEmblems';

interface GuildData {
    id: string;
    name: string;
    description: string | null;
    emblem?: string;
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
    const t = useTranslations('guild');
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
    const [showEmblemPicker, setShowEmblemPicker] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadGuildDetails = useCallback(async (guildId: string) => {
        const res = await fetch(`/api/guilds/${guildId}`);
        if (res.ok) {
            const data = await res.json();
            setActiveGuild(data.guild);
            setMembers(data.members || []);
            setQuests(data.quests || []);
            setUserRole(data.userRole || 'member');
        }
    }, []);

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

        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setCurrentUserId(data.user.id);
        });
    }, [loadGuildDetails]);

    useEffect(() => {
        if (activeGuild) {
            gsap.from('.guild-card', { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' });
        }
    }, [activeGuild?.id]);

    const handleJoin = async () => {
        if (!joinCode.trim() || joining) return;
        setJoining(true);
        try {
            const res = await fetch(`/api/guilds/join-by-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: joinCode.trim() }),
            });
            if (res.ok) {
                const data = await res.json();
                loadGuildDetails(data.guildId);
                setJoinCode('');
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
            await fetch(`/api/guilds/${activeGuild.id}/quests`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId }),
            });
            loadGuildDetails(activeGuild.id);
        } catch { /* silent */ }
        setContributingQuest(null);
    };

    const handleLeave = async () => {
        if (!activeGuild) return;
        setActionLoading('leave');
        const res = await fetch(`/api/guilds/${activeGuild.id}/leave`, { method: 'POST' });
        if (res.ok) {
            setGuilds([]);
            setActiveGuild(null);
        }
        setActionLoading(null);
    };

    const handleDelete = async () => {
        if (!activeGuild || !confirmDelete) return;
        setActionLoading('delete');
        const res = await fetch(`/api/guilds/${activeGuild.id}`, { method: 'DELETE' });
        if (res.ok) {
            setGuilds([]);
            setActiveGuild(null);
        }
        setActionLoading(null);
        setConfirmDelete(false);
    };

    const handleKick = async (userId: string) => {
        if (!activeGuild) return;
        setActionLoading(`kick-${userId}`);
        await fetch(`/api/guilds/${activeGuild.id}/members`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        loadGuildDetails(activeGuild.id);
        setActionLoading(null);
    };

    const handlePromote = async (userId: string, currentRole: string) => {
        if (!activeGuild) return;
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        setActionLoading(`role-${userId}`);
        await fetch(`/api/guilds/${activeGuild.id}/members`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role: newRole }),
        });
        loadGuildDetails(activeGuild.id);
        setActionLoading(null);
    };

    const handleEmblem = async (emblId: string) => {
        if (!activeGuild) return;
        await fetch(`/api/guilds/${activeGuild.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emblem: emblId }),
        });
        setActiveGuild(prev => prev ? { ...prev, emblem: emblId } : prev);
        setShowEmblemPicker(false);
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
                        <h2 className="font-heading text-2xl font-bold uppercase tracking-wider mb-2">{t('joinGuild')}</h2>
                        <p className="font-sans text-sm text-ghost/50 mb-6">{t('noGuild')}</p>

                        <button
                            onClick={() => setShowCreate(true)}
                            className="btn-magnetic w-full py-4 rounded-2xl bg-tertiary/10 border border-tertiary/30 text-tertiary font-heading text-sm uppercase tracking-wider hover:bg-tertiary/20 transition-all mb-4 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> {t('createGuild')}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
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
                                <LogIn size={14} /> {t('joinGuild')}
                            </button>
                        </div>
                    </div>
                </div>

                <CreateGuildModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreated={(guild) => {
                        setShowCreate(false);
                        setGuilds([{ ...guild, description: null, emblem: 'shield', member_count: 1, total_xp: 0, created_at: new Date().toISOString(), userRole: 'owner' }]);
                        loadGuildDetails(guild.id);
                    }}
                />
            </>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-tertiary/30 border-t-tertiary rounded-full animate-spin" />
            </div>
        );
    }

    const isOwner = userRole === 'owner';
    const isAdmin = ['owner', 'admin'].includes(userRole);

    // ── Guild Dashboard ──
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Guild Info + Members */}
            <div className="guild-card lg:col-span-3 space-y-4">
                {/* Guild Info */}
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6 text-center relative">
                    {/* Emblem */}
                    <button
                        onClick={() => isOwner && setShowEmblemPicker(v => !v)}
                        className={`w-16 h-16 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center p-3 mx-auto mb-3 text-tertiary ${isOwner ? 'hover:bg-tertiary/20 cursor-pointer transition-colors' : 'cursor-default'}`}
                        title={isOwner ? 'Click to change emblem' : ''}
                    >
                        {getEmblemIcon(activeGuild?.emblem || 'shield')}
                    </button>

                    {/* Emblem picker */}
                    {showEmblemPicker && isOwner && (
                        <div className="absolute z-20 left-1/2 -translate-x-1/2 top-24 bg-[#0d1530] border border-white/10 rounded-2xl p-3 grid grid-cols-5 gap-2 shadow-2xl">
                            {EMBLEMS.map(e => (
                                <button
                                    key={e.id}
                                    onClick={() => handleEmblem(e.id)}
                                    className={`w-10 h-10 p-2 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors ${activeGuild?.emblem === e.id ? 'bg-accent/20 border border-accent/40 text-accent' : 'text-ghost'}`}
                                    title={e.id}
                                >
                                    {e.icon}
                                </button>
                            ))}
                        </div>
                    )}

                    <h3 className="font-heading font-bold text-xl text-white mb-1">{activeGuild?.name}</h3>
                    {activeGuild?.description && (
                        <p className="font-sans text-xs text-ghost/40 mb-3">{activeGuild.description}</p>
                    )}
                    <div className="flex justify-around mt-4">
                        <div className="text-center">
                            <div className="font-heading text-lg text-accent font-bold">{activeGuild?.member_count || 0}</div>
                            <div className="font-data text-[10px] text-ghost/40 tracking-wider">{t('members').toUpperCase()}</div>
                        </div>
                        <div className="text-center">
                            <div className="font-heading text-lg text-accent-secondary font-bold">{(activeGuild?.total_xp || 0).toLocaleString()}</div>
                            <div className="font-data text-[10px] text-ghost/40 tracking-wider">{t('totalXp').toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                {/* Members */}
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5">
                    <div className="font-heading text-xs uppercase tracking-widest text-ghost/40 mb-3 flex items-center gap-2">
                        <Users size={12} /> {t('members')}
                    </div>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                        {members.length === 0 ? (
                            <p className="font-sans text-xs text-ghost/30 text-center py-4">No members found</p>
                        ) : members.map(m => {
                            const isMe = m.user_id === currentUserId;
                            const roleIcon = m.role === 'owner'
                                ? <Crown size={10} className="text-accent-secondary" />
                                : m.role === 'admin'
                                    ? <Star size={10} className="text-yellow-400" />
                                    : <Users size={10} className="text-ghost/30" />;
                            return (
                                <div key={m.user_id} className="flex items-center gap-2 py-1 group">
                                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        {roleIcon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="font-sans text-xs text-ghost/70 truncate block">
                                            {m.display_name || 'Hero'}
                                            {isMe && <span className="text-accent/50 ml-1">(you)</span>}
                                        </span>
                                        <span className={`font-data text-[9px] tracking-wider ${m.role === 'owner' ? 'text-accent-secondary' : m.role === 'admin' ? 'text-yellow-400/60' : 'text-ghost/25'}`}>
                                            {m.role === 'owner' ? '👑 GUILD MASTER' : m.role === 'admin' ? '⭐ CO-ADMIN' : 'MEMBER'}
                                        </span>
                                    </div>
                                    {/* Owner actions on non-owner members */}
                                    {isOwner && !isMe && m.role !== 'owner' && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handlePromote(m.user_id, m.role)}
                                                disabled={actionLoading === `role-${m.user_id}`}
                                                className="w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 hover:bg-yellow-400/20 transition-colors"
                                                title={m.role === 'admin' ? 'Demote to Member' : 'Promote to Co-Admin'}
                                            >
                                                {m.role === 'admin' ? <UserMinus size={10} /> : <UserCheck size={10} />}
                                            </button>
                                            <button
                                                onClick={() => handleKick(m.user_id)}
                                                disabled={actionLoading === `kick-${m.user_id}`}
                                                className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                                                title="Kick Member"
                                            >
                                                <UserMinus size={10} />
                                            </button>
                                        </div>
                                    )}
                                    {/* Admin kick (only members, not owners/other admins) */}
                                    {!isOwner && isAdmin && !isMe && m.role === 'member' && (
                                        <button
                                            onClick={() => handleKick(m.user_id)}
                                            disabled={actionLoading === `kick-${m.user_id}`}
                                            className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Kick Member"
                                        >
                                            <UserMinus size={10} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Invite */}
                {isAdmin && (
                    <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-5">
                        <div className="font-heading text-xs uppercase tracking-widest text-ghost/40 mb-3">{t('inviteCode')}</div>
                        {inviteCode ? (
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 font-data text-xs text-accent tracking-wider truncate">
                                    {inviteCode}
                                </div>
                                <button onClick={copyInvite} className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors shrink-0">
                                    {copiedInvite ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        ) : (
                            <button onClick={generateInvite} className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-ghost/50 font-data text-xs uppercase tracking-wider hover:bg-white/[0.06] transition-all">
                                {t('copyInvite')}
                            </button>
                        )}
                    </div>
                )}

                {/* Leave / Delete */}
                <div className="space-y-2">
                    {!isOwner && (
                        <button
                            onClick={handleLeave}
                            disabled={actionLoading === 'leave'}
                            className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-heading text-xs uppercase tracking-wider hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={14} /> {t('leave')}
                        </button>
                    )}
                    {isOwner && !confirmDelete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="w-full py-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500/50 font-heading text-xs uppercase tracking-wider hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} /> Delete Guild
                        </button>
                    )}
                    {isOwner && confirmDelete && (
                        <div className="bg-[#0C1021] rounded-2xl border border-red-500/30 p-4 space-y-2">
                            <p className="font-sans text-xs text-red-400 text-center">This will permanently delete the guild and all data!</p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-ghost/50 font-data text-xs uppercase tracking-wider hover:bg-white/5 transition-colors">Cancel</button>
                                <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-data text-xs uppercase tracking-wider hover:bg-red-500/30 transition-colors">
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Center: Guild Quests */}
            <div className="guild-card lg:col-span-5">
                <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading font-bold text-xl uppercase tracking-wider flex items-center gap-2">
                            <Swords size={20} className="text-tertiary" /> {t('guildQuests')}
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
                                {isAdmin && <p className="font-data text-xs text-ghost/25 mt-1">Create one to rally your guild!</p>}
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
                        <GuildChat
                            guildId={activeGuild.id}
                            currentUserId={currentUserId}
                            members={members}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
