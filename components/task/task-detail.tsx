'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ProofUpload } from './proof-upload'
import { TaskCompletionDialog } from './task-completion-dialog'
import { TaskFeedbackDialog } from './task-feedback-dialog'
import { LevelUpModal } from '@/components/shared/level-up-modal'
import { XpAnimation } from '@/components/shared/xp-animation'
import type { Task } from '@/lib/types'

interface TaskDetailProps {
  task: Task
  userId: string
  currentXp: number
  currentLevel: number
  nextLevelXp: number | null
  nextLevelTitle: string | null
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  hard: 'bg-orange-500/10 text-orange-400',
  epic: 'bg-purple-500/10 text-purple-400',
}

export function TaskDetail({ task, userId, currentXp, currentLevel, nextLevelXp, nextLevelTitle }: TaskDetailProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showXpAnim, setShowXpAnim] = useState(false)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [newLevel, setNewLevel] = useState(currentLevel)

  const isCompleted = task.status === 'completed'

  const handleComplete = async () => {
    setCompleting(true)
    const supabase = createClient()

    // Update task status
    await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        proof_url: proofUrl,
      })
      .eq('id', task.id)

    // Log XP
    await supabase.from('xp_logs').insert({
      user_id: userId,
      amount: task.xp_reward,
      source: 'task_completion',
      task_id: task.id,
    })

    // Update user XP
    const newXp = currentXp + task.xp_reward
    const updateData: Record<string, unknown> = { total_xp: newXp }

    // Check level up
    if (nextLevelXp && newXp >= nextLevelXp) {
      updateData.level = currentLevel + 1
      setNewLevel(currentLevel + 1)
    }

    await supabase.from('users').update(updateData).eq('id', userId)

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (streak) {
      const lastActivity = streak.last_activity_date
      let newStreak = streak.current_streak
      if (lastActivity === today) {
        // Already active today, keep current streak
        newStreak = streak.current_streak
      } else if (lastActivity) {
        // Check if last activity was yesterday
        const lastDate = new Date(lastActivity + 'T00:00:00')
        const todayDate = new Date(today + 'T00:00:00')
        const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        newStreak = diffDays === 1 ? streak.current_streak + 1 : 1
      } else {
        newStreak = 1
      }
      await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_activity_date: today,
        })
        .eq('user_id', userId)
    }

    setShowConfirm(false)
    setShowXpAnim(true)

    setTimeout(() => {
      setShowXpAnim(false)
      // Show feedback dialog after XP animation
      setShowFeedback(true)
    }, 1500)
  }

  const handleFeedbackSubmit = async (feedback: {
    difficulty_rating: number
    enjoyment_score: number
    time_taken?: string
    notes?: string
  }) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      })

      if (!response.ok) {
        console.error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }

    // Close feedback and show level up or redirect
    setShowFeedback(false)
    if (nextLevelXp && currentXp + task.xp_reward >= nextLevelXp) {
      setShowLevelUp(true)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleFeedbackClose = (open: boolean) => {
    if (!open) {
      // User closed/skipped feedback
      if (nextLevelXp && currentXp + task.xp_reward >= nextLevelXp) {
        setShowLevelUp(true)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setShowFeedback(open)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="glass-card gradient-border rounded-2xl p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${difficultyColors[task.difficulty] ?? 'bg-muted text-muted-foreground'}`}>
                {task.difficulty}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {task.category}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">{task.title}</h1>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-bold text-primary">+{task.xp_reward} XP</span>
          </div>
        </div>

        {task.description && (
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{task.description}</p>
        )}

        {isCompleted ? (
          <div className="flex items-center gap-2 rounded-xl bg-accent/10 p-4 text-accent">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Quest completed!</span>
          </div>
        ) : (
          <>
            <ProofUpload
              taskId={task.id}
              userId={userId}
              onUpload={setProofUrl}
            />

            <Button
              onClick={() => setShowConfirm(true)}
              size="lg"
              className="mt-6 w-full gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Quest
            </Button>
          </>
        )}
      </div>

      <TaskCompletionDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        xpReward={task.xp_reward}
        onConfirm={handleComplete}
        loading={completing}
      />

      <TaskFeedbackDialog
        open={showFeedback}
        onOpenChange={handleFeedbackClose}
        taskId={task.id}
        taskTitle={task.title}
        onSubmit={handleFeedbackSubmit}
      />

      <LevelUpModal
        open={showLevelUp}
        onClose={() => {
          setShowLevelUp(false)
          router.push('/dashboard')
          router.refresh()
        }}
        level={newLevel}
        title={nextLevelTitle ?? 'Hero'}
      />

      {showXpAnim && <XpAnimation xp={task.xp_reward} />}
    </div>
  )
}
