'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QUIZ_QUESTIONS } from '@/lib/constants'
import type { QuizAnswer, PersonalityType, TaskCategory } from '@/lib/types'
import { awardXp } from '@/lib/api/xp'
import { WelcomeStep } from './welcome-step'
import { QuizStep } from './quiz-step'
import { GoalSettingStep } from './goal-setting-step'
import { OnboardingProgress } from './onboarding-progress'

type Step = 'welcome' | 'quiz' | 'goals' | 'complete'

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
  const [step, setStep] = useState<Step>('welcome')
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(false)

  const totalSteps = 3
  const currentStepIndex = step === 'welcome' ? 0 : step === 'quiz' ? 1 : 2

  const handleQuizAnswer = (answer: QuizAnswer) => {
    const newAnswers = [...quizAnswers, answer]
    setQuizAnswers(newAnswers)

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setStep('goals')
    }
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

    // Update user profile — this MUST succeed for onboarding to complete
    const { error: updateError } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        personality_type: personalityType,
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

    // Try to generate initial tasks (will silently fail if n8n isn't configured)
    try {
      await fetch('/api/ai/generate-tasks', { method: 'POST' })
    } catch {
      // n8n not configured yet, skip
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

      {step === 'goals' && (
        <GoalSettingStep onComplete={handleGoalsComplete} loading={loading} maxGoals={maxGoals} />
      )}
    </div>
  )
}
