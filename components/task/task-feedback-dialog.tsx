'use client'

import { useState } from 'react'
import { Star, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface TaskFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  taskTitle: string
  onSubmit: (feedback: {
    difficulty_rating: number
    enjoyment_score: number
    time_taken?: string
    notes?: string
  }) => Promise<void>
}

export function TaskFeedbackDialog({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  onSubmit,
}: TaskFeedbackDialogProps) {
  const [difficultyRating, setDifficultyRating] = useState(3)
  const [enjoymentScore, setEnjoymentScore] = useState(3)
  const [timeTaken, setTimeTaken] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit({
        difficulty_rating: difficultyRating,
        enjoyment_score: enjoymentScore,
        time_taken: timeTaken || undefined,
        notes: notes || undefined,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    onOpenChange(false)
  }

  const StarRating = ({
    label,
    value,
    onChange,
    labels,
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    labels: string[]
  }) => (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="group flex flex-col items-center gap-1"
          >
            <Star
              className={`h-8 w-8 transition-all ${
                rating <= value
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground group-hover:text-primary/50'
              }`}
            />
            <span className="text-xs text-muted-foreground">{labels[rating - 1]}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Feedback</DialogTitle>
          <DialogDescription>Help us personalize future tasks for you</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-medium text-foreground">{taskTitle}</p>
          </div>

          <StarRating
            label="How difficult was this task?"
            value={difficultyRating}
            onChange={setDifficultyRating}
            labels={['Too easy', 'Easy', 'Just right', 'Hard', 'Too hard']}
          />

          <StarRating
            label="How much did you enjoy it?"
            value={enjoymentScore}
            onChange={setEnjoymentScore}
            labels={['Hated it', 'Disliked', 'Neutral', 'Liked', 'Loved it']}
          />

          <div className="mb-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4" />
              How long did it take? (optional)
            </label>
            <Input
              placeholder="e.g., 15 minutes, 1 hour"
              value={timeTaken}
              onChange={(e) => setTimeTaken(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Any notes? (optional)
            </label>
            <Textarea
              placeholder="What made this task easy/hard?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background/50"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSkip} variant="outline" className="flex-1">
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
