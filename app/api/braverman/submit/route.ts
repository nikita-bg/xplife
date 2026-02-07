import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BRAVERMAN_QUESTIONS, BRAVERMAN_XP_REWARD } from '@/lib/constants/braverman-questions'
import type { PersonalityType } from '@/lib/types'

interface AnswerInput {
  questionId: number
  score: number
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user level
  const { data: profile } = await supabase
    .from('users')
    .select('level, total_xp')
    .eq('id', user.id)
    .single()

  if (!profile || profile.level < 2) {
    return NextResponse.json(
      { error: 'Braverman test unlocks at level 2' },
      { status: 403 }
    )
  }

  let answers: AnswerInput[]
  try {
    const body = await request.json()
    answers = body.answers
    if (!Array.isArray(answers) || answers.length !== BRAVERMAN_QUESTIONS.length) {
      return NextResponse.json(
        { error: `Expected ${BRAVERMAN_QUESTIONS.length} answers` },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Build question lookup
  const questionMap = new Map(BRAVERMAN_QUESTIONS.map((q) => [q.id, q]))

  // Calculate scores per neurotransmitter
  const scores: Record<PersonalityType, number> = {
    dopamine: 0,
    acetylcholine: 0,
    gaba: 0,
    serotonin: 0,
  }

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId)
    if (!question) continue
    const score = Math.min(3, Math.max(0, Math.round(answer.score)))
    scores[question.neurotransmitter] += score
  }

  // Determine dominant type (highest score = biggest deficiency)
  const dominantType = (Object.entries(scores) as [PersonalityType, number][])
    .sort((a, b) => b[1] - a[1])[0][0]

  // Upsert braverman_results
  const { error: upsertError } = await supabase
    .from('braverman_results')
    .upsert({
      user_id: user.id,
      dopamine_score: scores.dopamine,
      acetylcholine_score: scores.acetylcholine,
      gaba_score: scores.gaba,
      serotonin_score: scores.serotonin,
      dominant_type: dominantType,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (upsertError) {
    console.error('Failed to save braverman results:', upsertError)
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
  }

  // Update user profile with scores and personality type
  await supabase
    .from('users')
    .update({
      personality_type: dominantType,
      dopamine_score: scores.dopamine,
      acetylcholine_score: scores.acetylcholine,
      gaba_score: scores.gaba,
      serotonin_score: scores.serotonin,
    })
    .eq('id', user.id)

  // Award XP
  const newXp = profile.total_xp + BRAVERMAN_XP_REWARD

  await supabase.from('xp_logs').insert({
    user_id: user.id,
    amount: BRAVERMAN_XP_REWARD,
    source: 'braverman_test',
  })

  // Check level up
  const { data: nextLevel } = await supabase
    .from('level_config')
    .select('*')
    .eq('level', profile.level + 1)
    .single()

  const leveledUp = nextLevel && newXp >= nextLevel.xp_required

  await supabase
    .from('users')
    .update({
      total_xp: newXp,
      ...(leveledUp ? { level: profile.level + 1 } : {}),
    })
    .eq('id', user.id)

  return NextResponse.json({
    scores,
    dominantType,
    xpAwarded: BRAVERMAN_XP_REWARD,
    newXp,
    leveledUp: !!leveledUp,
    newLevel: leveledUp ? profile.level + 1 : profile.level,
    levelTitle: leveledUp ? nextLevel!.title : null,
  })
}
