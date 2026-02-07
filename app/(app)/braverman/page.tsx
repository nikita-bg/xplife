import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Lock } from 'lucide-react'
import { BravermanTest } from '@/components/braverman/braverman-test'
import { BravermanResults } from '@/components/braverman/braverman-results'
import { BRAVERMAN_UNLOCK_LEVEL } from '@/lib/constants/braverman-questions'
import type { PersonalityType } from '@/lib/types'

export default async function BravermanPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('level')
    .eq('id', user.id)
    .single()

  if (!profile || profile.level < BRAVERMAN_UNLOCK_LEVEL) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Locked
        </h1>
        <p className="text-center text-muted-foreground max-w-sm">
          The Braverman Nature Assessment unlocks at Level {BRAVERMAN_UNLOCK_LEVEL}.
          Complete daily quests to earn XP and level up!
        </p>
      </div>
    )
  }

  // Check if already completed
  const { data: existingResult } = await supabase
    .from('braverman_results')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (existingResult) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Braverman Assessment
          </h1>
          <p className="text-sm text-muted-foreground">
            Your personality profile results
          </p>
        </div>
        <BravermanResults
          scores={{
            dopamine: existingResult.dopamine_score,
            acetylcholine: existingResult.acetylcholine_score,
            gaba: existingResult.gaba_score,
            serotonin: existingResult.serotonin_score,
          }}
          dominantType={existingResult.dominant_type as PersonalityType}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Braverman Nature Assessment
        </h1>
        <p className="text-sm text-muted-foreground">
          140 questions to discover your neurotransmitter profile. Earn 500 XP on completion.
        </p>
      </div>
      <BravermanTest />
    </div>
  )
}
