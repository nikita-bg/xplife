'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import { BRAVERMAN_QUESTIONS } from '@/lib/constants/braverman-questions'
import type { PersonalityType } from '@/lib/types'
import BravermanResults from './BravermanResults'

const STORAGE_KEY = 'braverman-progress'

const SECTION_KEYS: { label: string; neurotransmitter: PersonalityType; start: number; end: number }[] = [
    { label: 'Part 1: Dopamine', neurotransmitter: 'dopamine', start: 0, end: 34 },
    { label: 'Part 2: Acetylcholine', neurotransmitter: 'acetylcholine', start: 35, end: 69 },
    { label: 'Part 3: GABA', neurotransmitter: 'gaba', start: 70, end: 104 },
    { label: 'Part 4: Serotonin', neurotransmitter: 'serotonin', start: 105, end: 139 },
]

const scoreLabels = ['Never', 'Sometimes', 'Often', 'Always']
const scoreColors = [
    'border-white/10 text-ghost/50 hover:border-white/20',
    'border-yellow-500/20 text-yellow-400/70 hover:border-yellow-500/40',
    'border-orange-500/20 text-orange-400/70 hover:border-orange-500/40',
    'border-red-500/20 text-red-400/70 hover:border-red-500/40',
]
const scoreColorsSelected = [
    'border-white/40 bg-white/10 text-white',
    'border-yellow-500/50 bg-yellow-500/15 text-yellow-400',
    'border-orange-500/50 bg-orange-500/15 text-orange-400',
    'border-red-500/50 bg-red-500/15 text-red-400',
]

interface SavedProgress {
    answers: Record<number, number>
    currentIndex: number
}

export default function BravermanTest() {
    const router = useRouter()
    const pathname = usePathname()
    const locale = pathname.split('/')[1] || 'en'
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
        } catch { /* ignore */ }
    }, [])

    const saveProgress = useCallback((ans: Record<number, number>, idx: number) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: ans, currentIndex: idx }))
        } catch { /* ignore */ }
    }, [])

    const question = BRAVERMAN_QUESTIONS[currentIndex]
    const totalQuestions = BRAVERMAN_QUESTIONS.length
    const currentSection = SECTION_KEYS.find(s => currentIndex >= s.start && currentIndex <= s.end)
    const allAnswered = Object.keys(answers).length === totalQuestions
    const isLastQuestion = currentIndex === totalQuestions - 1
    const answeredCount = Object.keys(answers).length

    const handleAnswer = (score: number) => {
        const newAnswers = { ...answers, [question.id]: score }
        setAnswers(newAnswers)
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
            const n = currentIndex - 1
            setCurrentIndex(n)
            saveProgress(answers, n)
        }
    }

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            const n = currentIndex + 1
            setCurrentIndex(n)
            saveProgress(answers, n)
        }
    }

    const handleSubmit = async () => {
        if (!allAnswered) {
            setError(`Please answer all ${totalQuestions} questions before submitting.`)
            return
        }
        setError(null)
        setSubmitting(true)
        try {
            const answersArray = BRAVERMAN_QUESTIONS.map(q => ({
                questionId: q.id,
                score: answers[q.id] ?? 0,
            }))
            const scores: Record<string, number> = { dopamine: 0, acetylcholine: 0, gaba: 0, serotonin: 0 }
            BRAVERMAN_QUESTIONS.forEach(q => { scores[q.neurotransmitter] += answers[q.id] ?? 0 })
            const dominantType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]

            const res = await fetch('/api/braverman/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: answersArray, dominantType, scores }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(data?.error || 'Failed to submit test')
            }
            const data = await res.json()
            setResults({ ...data, scores, dominantType })
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
            <div className="space-y-6">
                <div className="bg-[#0C1021] rounded-[2rem] border border-accent/20 p-8 text-center shadow-[0_0_40px_rgba(0,245,255,0.08)]">
                    <Sparkles size={32} className="mx-auto mb-3 text-accent" />
                    <h2 className="font-heading text-2xl font-bold text-accent uppercase tracking-wider">
                        +{results.xpAwarded || 500} XP Earned!
                    </h2>
                    {results.leveledUp && (
                        <p className="font-data text-sm text-accent-secondary mt-2">Level Up! You are now Level {results.newLevel}</p>
                    )}
                </div>
                <BravermanResults scores={results.scores} dominantType={results.dominantType} locale={locale} />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Progress */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="font-data text-xs text-ghost/50 tracking-wider uppercase">{currentSection?.label}</span>
                    <span className="font-data text-xs text-ghost/40">{currentIndex + 1} of {totalQuestions} ({answeredCount} answered)</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="bg-[#0C1021] rounded-[2rem] border border-white/5 p-8">
                <p className="font-sans text-lg text-white font-medium mb-8">{question.question}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {scoreLabels.map((label, score) => {
                        const isSelected = answers[question.id] === score
                        return (
                            <button
                                key={score}
                                onClick={() => handleAnswer(score)}
                                className={`rounded-2xl border-2 px-4 py-4 text-sm font-medium transition-all duration-200 ${isSelected ? scoreColorsSelected[score] : scoreColors[score]
                                    } ${isSelected ? 'scale-[1.03]' : 'hover:scale-[1.02]'}`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-ghost/50 font-data text-xs uppercase tracking-wider hover:bg-white/10 disabled:opacity-30 transition-all"
                >
                    <ChevronLeft size={14} /> Previous
                </button>

                {isLastQuestion && allAnswered ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-secondary to-yellow-500 text-background font-heading text-sm uppercase tracking-wider font-bold disabled:opacity-50 transition-all"
                    >
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Sparkles size={16} /> Submit Assessment</>}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={isLastQuestion}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-ghost/50 font-data text-xs uppercase tracking-wider hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                )}
            </div>

            {error && <p className="font-sans text-sm text-red-400 text-center">{error}</p>}

            {/* Quick nav dots */}
            <div className="flex items-center justify-center gap-0.5 flex-wrap">
                {BRAVERMAN_QUESTIONS.map((q, i) => (
                    <button
                        key={q.id}
                        onClick={() => { setCurrentIndex(i); saveProgress(answers, i) }}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-accent scale-[2]'
                                : answers[q.id] !== undefined ? 'bg-accent/40'
                                    : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
