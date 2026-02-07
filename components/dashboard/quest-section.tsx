'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCard } from './task-card'
import { GenerateQuestDialog } from './generate-quest-dialog'
import type { Task, QuestTimeframe } from '@/lib/types'

interface QuestSectionProps {
  title: string
  timeframe: QuestTimeframe
  quests: Task[]
  parentQuests?: Task[]
  maxQuests?: number
}

export function QuestSection({
  title,
  timeframe,
  quests,
  parentQuests = [],
  maxQuests,
}: QuestSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const pendingQuests = quests.filter((t) => t.status !== 'completed')
  const completedQuests = quests.filter((t) => t.status === 'completed')
  const atLimit = maxQuests !== undefined && quests.length >= maxQuests

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">
          {title}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({quests.length}{maxQuests ? `/${maxQuests}` : ''})
          </span>
        </h2>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={atLimit}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      </div>

      {quests.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="font-display text-lg font-bold text-foreground">No Quests Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Click &ldquo;Generate&rdquo; to create AI-powered {timeframe} quests.
          </p>
        </div>
      ) : (
        <>
          {pendingQuests.length > 0 && (
            <div className="flex flex-col gap-3">
              {pendingQuests.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {completedQuests.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              {completedQuests.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </>
      )}

      <GenerateQuestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        timeframe={timeframe}
        parentQuests={parentQuests}
      />
    </div>
  )
}
