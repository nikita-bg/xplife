'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useMessages } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { getQuizQuestions } from '@/lib/constants'
import type { QuizAnswer, PersonalityType, TaskCategory } from '@/lib/types'
import { awardXp } from '@/lib/api/xp'
import { WelcomeStep } from './welcome-step'
import { QuizStep } from './quiz-step'
import { TimePreferencesStep } from './time-preferences-step'
import { LifestyleStep } from './lifestyle-step'
import { InterestsStep } from './interests-step'
import { GoalSettingStep } from './goal-setting-step'
import { OnboardingProgress } from './onboarding-progress'

type Step = 'welcome' | 'quiz' | 'time-preferences' | 'lifestyle' | 'interests' | 'goals' | 'complete'

function calculatePersonality(answers: QuizAnswer[]): PersonalityType {
  const counts: Record<PersonalityType, number> = {
    dopamine: 0,
    acetylcholine: 0,
    gaba: 0,
    serotonin: 0,
  }

  answers.forEach((a) => {
    counts[a.personality]++
  })

  return (Object.entries(counts) as [PersonalityType, number][]).reduce((a, b) =>
    a[1] >= b[1] ? a : b
  )[0]
}

interface OnboardingFlowProps {
  userId: string
  onComplete?: () => void
  maxGoals?: number
}

export function OnboardingFlow({ userId, onComplete, maxGoals = 1 }: OnboardingFlowProps) {
  const router = useRouter()
  const messages = useMessages()
  const quizMessages = (messages as any).quiz || {}
  const QUIZ_QUESTIONS = getQuizQuestions(quizMessages)
  const [step, setStep] = useState<Step>('welcome')
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(false)

  // Personalization data
  const [timePreference, setTimePreference] = useState<string>('morning')
  const [preferredTaskDuration, setPreferredTaskDuration] = useState<string>('medium')
  const [occupationType, setOccupationType] = useState<string | null>(null)
  const [workSchedule, setWorkSchedule] = useState<string | null>(null)
  const [lifePhase, setLifePhase] = useState<string | null>(null)
  const [mainChallenge, setMainChallenge] = useState<string | null>(null)
  const [interests, setInterests] = useState<string[]>([])

  const totalSteps = 6
  const stepMap: Record<Step, number> = {
    welcome: 0,
    quiz: 1,
    'time-preferences': 2,
    lifestyle: 3,
    interests: 4,
    goals: 5,
    complete: 6,
  }
  const currentStepIndex = stepMap[step] || 0

  const handleQuizAnswer = (answer: QuizAnswer) => {
    const newAnswers = [...quizAnswers, answer]
    setQuizAnswers(newAnswers)

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setStep('time-preferences')
    }
  }

  const handleTimePreferences = (data: { timePreference: string; preferredTaskDuration: string }) => {
    setTimePreference(data.timePreference)
    setPreferredTaskDuration(data.preferredTaskDuration)
    setStep('lifestyle')
  }

  const handleLifestyle = (data: {
    occupationType: string | null
    workSchedule: string | null
    lifePhase: string | null
    mainChallenge: string | null
  }) => {
    setOccupationType(data.occupationType)
    setWorkSchedule(data.workSchedule)
    setLifePhase(data.lifePhase)
    setMainChallenge(data.mainChallenge)
    setStep('interests')
  }

  const handleInterests = (selectedInterests: string[]) => {
    setInterests(selectedInterests)
    setStep('goals')
  }

  const handleGoalsComplete = async (goals: { category: TaskCategory; title: string }[]) => {
    setLoading(true)

    const personalityType = calculatePersonality(quizAnswers)
    const supabase = createClient()

    // Insert goals
    const goalInserts = goals.map((g) => ({
      user_id: userId,
      title: g.title,
      category: g.category,
    }))
    const { error: goalsError } = await supabase.from('goals').insert(goalInserts)
    if (goalsError) console.error('Goals insert error:', goalsError)

    // Insert interests if any
    if (interests.length > 0) {
      const interestInserts = interests.map((interest) => ({
        user_id: userId,
        interest,
      }))
      const { error: interestsError } = await supabase.from('user_interests').insert(interestInserts)
      if (interestsError) console.error('Interests insert error:', interestsError)
    }

    // Update user profile with all personalization data — this MUST succeed for onboarding to complete
    const { error: updateError } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        personality_type: personalityType,
        time_preference: timePreference,
        preferred_task_duration: preferredTaskDuration,
        occupation_type: occupationType,
        work_schedule: workSchedule,
        life_phase: lifePhase,
        main_challenge: mainChallenge,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Onboarding update error:', updateError)
      setLoading(false)
      alert('Failed to save onboarding. Please try again.')
      return
    }

    // Award 25 XP for completing the onboarding quiz
    try {
      await awardXp(userId, 25, 'onboarding_quiz')
    } catch (err) {
      console.error('Failed to award onboarding XP:', err)
    }

    // Generate initial tasks based on the onboarding data
    try {
      const goalsText = goals.map((g) => g.title).join(', ')
      const res = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals: goalsText,
          questTimeframe: 'daily',
          generationMode: 'manual',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        console.error('Initial task generation failed:', res.status, data?.error)
      }
    } catch (err) {
      console.error('Initial task generation error:', err)
    }

    if (onComplete) {
      onComplete()
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-8">
      <OnboardingProgress currentStep={currentStepIndex} totalSteps={totalSteps} />

      {step === 'welcome' && (
        <WelcomeStep onContinue={() => setStep('quiz')} />
      )}

      {step === 'quiz' && (
        <QuizStep
          question={QUIZ_QUESTIONS[currentQuestion]}
          questionNumber={currentQuestion + 1}
          totalQuestions={QUIZ_QUESTIONS.length}
          onAnswer={handleQuizAnswer}
        />
      )}

      {step === 'time-preferences' && (
        <TimePreferencesStep onComplete={handleTimePreferences} />
      )}

      {step === 'lifestyle' && (
        <LifestyleStep onComplete={handleLifestyle} />
      )}

      {step === 'interests' && (
        <InterestsStep onComplete={handleInterests} />
      )}

      {step === 'goals' && (
        <GoalSettingStep onComplete={handleGoalsComplete} loading={loading} maxGoals={maxGoals} />
      )}
    </div>
  )
}
