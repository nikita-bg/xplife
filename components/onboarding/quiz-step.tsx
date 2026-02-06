'use client'

import { Button } from '@/components/ui/button'
import type { QuizQuestion, QuizAnswer } from '@/lib/types'

interface QuizStepProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (answer: QuizAnswer) => void
}

export function QuizStep({ question, questionNumber, totalQuestions, onAnswer }: QuizStepProps) {
  return (
    <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12">
      <div className="mb-2 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-accent">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      <h2 className="mb-8 text-center font-display text-xl font-bold text-foreground sm:text-2xl">
        {question.question}
      </h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            className="h-auto justify-start whitespace-normal px-5 py-4 text-left text-sm leading-relaxed bg-background/50 hover:bg-primary/10 hover:border-primary/50 transition-all"
            onClick={() =>
              onAnswer({
                questionId: question.id,
                personality: option.personality,
              })
            }
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
