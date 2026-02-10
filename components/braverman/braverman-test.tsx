'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useMessages } from 'next-intl'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BRAVERMAN_QUESTIONS } from '@/lib/constants/braverman-questions'
import { BravermanResults } from './braverman-results'
import type { PersonalityType } from '@/lib/types'

const STORAGE_KEY = 'braverman-progress'

const SECTION_KEYS: { key: string; neurotransmitter: PersonalityType; start: number; end: number }[] = [
  { key: 'sectionDopamine', neurotransmitter: 'dopamine', start: 0, end: 34 },
  { key: 'sectionAcetylcholine', neurotransmitter: 'acetylcholine', start: 35, end: 69 },
  { key: 'sectionGaba', neurotransmitter: 'gaba', start: 70, end: 104 },
  { key: 'sectionSerotonin', neurotransmitter: 'serotonin', start: 105, end: 139 },
]

interface SavedProgress {
  answers: Record<number, number>
  currentIndex: number
}

export function BravermanTest() {
  const router = useRouter()
  const t = useTranslations('braverman.test')
  const messages = useMessages()
  const translatedQuestions = (messages as any)?.braverman?.questions as string[] | undefined
  const scoreLabels = [t('never'), t('sometimes'), t('often'), t('always')]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<{
    scores: Record<PersonalityType, number>
    dominantType: string
    xpAwarded: number
    leveledUp: boolean
    newLevel: number
  } | null>(null)

  // Load saved progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: SavedProgress = JSON.parse(saved)
        setAnswers(parsed.answers)
        setCurrentIndex(parsed.currentIndex)
      }
    } catch {
      // ignore
    }
  }, [])

  // Save progress
  const saveProgress = useCallback((ans: Record<number, number>, idx: number) => {
    try {
      const data: SavedProgress = { answers: ans, currentIndex: idx }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore
    }
  }, [])

  const question = BRAVERMAN_QUESTIONS[currentIndex]
  const totalQuestions = BRAVERMAN_QUESTIONS.length
  const currentSection = SECTION_KEYS.find(
    (s) => currentIndex >= s.start && currentIndex <= s.end
  )
  const allAnswered = Object.keys(answers).length === totalQuestions
  const isLastQuestion = currentIndex === totalQuestions - 1

  const handleAnswer = (score: number) => {
    const newAnswers = { ...answers, [question.id]: score }
    setAnswers(newAnswers)

    // Auto-advance if not on last question
    if (!isLastQuestion) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      saveProgress(newAnswers, nextIndex)
    } else {
      saveProgress(newAnswers, currentIndex)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      saveProgress(answers, newIndex)
    }
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      saveProgress(answers, newIndex)
    }
  }

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError(t('error', { count: totalQuestions }))
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const answersArray = BRAVERMAN_QUESTIONS.map((q) => ({
        questionId: q.id,
        score: answers[q.id] ?? 0,
      }))

      const res = await fetch('/api/braverman/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to submit test')
      }

      const data = await res.json()
      setResults(data)
      localStorage.removeItem(STORAGE_KEY)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test')
    } finally {
      setSubmitting(false)
    }
  }

  if (results) {
    return (
      <div className="flex flex-col gap-6">
        <div className="glass-card rounded-2xl p-6 text-center">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-accent" />
          <h2 className="font-display text-xl font-bold text-foreground">
            {t('xpEarned', { xp: results.xpAwarded })}
          </h2>
          {results.leveledUp && (
            <p className="text-sm text-accent mt-1">
              {t('levelUp', { level: results.newLevel })}
            </p>
          )}
        </div>
        <BravermanResults scores={results.scores} dominantType={results.dominantType} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {currentSection ? t(currentSection.key as any) : ''}
          </span>
          <span className="text-sm text-muted-foreground">
            {t('progress', { current: currentIndex + 1, total: totalQuestions })}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="glass-card rounded-2xl p-6">
        <p className="text-lg font-medium text-foreground mb-6">
          {translatedQuestions?.[currentIndex] || question.question}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {scoreLabels.map((label, score) => {
            const isSelected = answers[question.id] === score
            return (
              <button
                key={score}
                onClick={() => handleAnswer(score)}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('previous')}
        </Button>

        {isLastQuestion && allAnswered ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {submitting ? t('submitting') : t('submit')}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={isLastQuestion}
            className="gap-1"
          >
            {t('next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Quick navigation dots showing answered status */}
      <div className="flex items-center justify-center gap-0.5 flex-wrap">
        {BRAVERMAN_QUESTIONS.map((q, i) => (
          <button
            key={q.id}
            onClick={() => {
              setCurrentIndex(i)
              saveProgress(answers, i)
            }}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentIndex
                ? 'bg-primary scale-150'
                : answers[q.id] !== undefined
                  ? 'bg-accent/60'
                  : 'bg-muted-foreground/30'
            }`}
            title={t('questionTooltip', { number: i + 1 })}
          />
        ))}
      </div>
    </div>
  )
}
