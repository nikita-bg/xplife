'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, Streak } from '@/lib/types'

interface ProfileState {
    user: User | null
    profile: UserProfile | null
    streak: Streak | null
    loading: boolean
    error: string | null
}

export function useProfile() {
    const [state, setState] = useState<ProfileState>({
        user: null,
        profile: null,
        streak: null,
        loading: true,
        error: null,
    })

    const fetchAll = useCallback(async () => {
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setState({ user: null, profile: null, streak: null, loading: false, error: null })
                return
            }

            const [profileRes, streakRes] = await Promise.all([
                supabase.from('users').select('*').eq('id', user.id).single(),
                supabase.from('streaks').select('*').eq('user_id', user.id).single(),
            ])

            setState({
                user,
                profile: profileRes.data as UserProfile | null,
                streak: streakRes.data as Streak | null,
                loading: false,
                error: profileRes.error?.message || null,
            })
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            }))
        }
    }, [])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    const refresh = useCallback(() => {
        setState(prev => ({ ...prev, loading: true }))
        fetchAll()
    }, [fetchAll])

    return { ...state, refresh }
}
