'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TaskCard } from './task-card'
import { GenerateQuestDialog } from './generate-quest-dialog'
import { QuestProgress } from './quest-progress'
import type { Task, QuestTimeframe } from '@/lib/types'
import { useTranslations } from 'next-intl'

interface QuestSectionProps {
  title: string
  timeframe: QuestTimeframe
  quests: Task[]
  parentQuests?: Task[]
  maxQuests?: number
  plan?: string
}

export function QuestSection({
  title,
  timeframe,
  quests,
  parentQuests = [],
  maxQuests,
  plan = 'free',
}: QuestSectionProps) {
  const t = useTranslations('dashboard.questSection')
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
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={() => setDialogOpen(true)}
            disabled={atLimit}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t('generate')}
          </Button>
          {atLimit && plan === 'free' && (
            <Link
              href="/pricing"
              className="text-xs text-primary hover:underline"
            >
              {t('upgradeForMore')}
            </Link>
          )}
        </div>
      </div>

      <QuestProgress
        completed={completedQuests.length}
        total={quests.length}
        timeframe={timeframe}
      />

      {quests.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="font-display text-lg font-bold text-foreground">{t('noQuestsTitle')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('noQuestsDescription', { timeframe })}
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
              <h3 className="text-sm font-medium text-muted-foreground">{t('completed')}</h3>
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
