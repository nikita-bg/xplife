'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestSection } from './quest-section'
import { getPlanLimits } from '@/lib/plan-limits'
import { useTranslations, useLocale } from 'next-intl'
import { Loader2 } from 'lucide-react'
import type { Task, QuestTimeframe } from '@/lib/types'

interface QuestsViewProps {
  yearlyQuests: Task[]
  monthlyQuests: Task[]
  weeklyQuests: Task[]
  dailyQuests: Task[]
  plan?: string
}

const AUTO_GEN_ORDER: QuestTimeframe[] = ['monthly', 'weekly', 'daily']

function getParentQuests(
  timeframe: QuestTimeframe,
  yearlyQuests: Task[],
  monthlyQuests: Task[],
  weeklyQuests: Task[],
): Task[] {
  switch (timeframe) {
    case 'monthly': return yearlyQuests
    case 'weekly': return monthlyQuests
    case 'daily': return weeklyQuests
    default: return []
  }
}

function getQuests(
  timeframe: QuestTimeframe,
  yearlyQuests: Task[],
  monthlyQuests: Task[],
  weeklyQuests: Task[],
  dailyQuests: Task[],
): Task[] {
  switch (timeframe) {
    case 'yearly': return yearlyQuests
    case 'monthly': return monthlyQuests
    case 'weekly': return weeklyQuests
    case 'daily': return dailyQuests
  }
}

export function QuestsView({
  yearlyQuests,
  monthlyQuests,
  weeklyQuests,
  dailyQuests,
  plan,
}: QuestsViewProps) {
  const planLimits = getPlanLimits(plan)
  const t = useTranslations('dashboard.questTabs')
  const tAuto = useTranslations('dashboard.autoRefresh')
  const locale = useLocale()
  const router = useRouter()

  const [autoGenerating, setAutoGenerating] = useState<QuestTimeframe | null>(null)
  const autoGenAttempted = useRef<Set<QuestTimeframe>>(new Set())

  const shouldAutoGenerate = useCallback((
    timeframe: QuestTimeframe,
    quests: Task[],
    parentQuests: Task[],
  ): boolean => {
    if (timeframe === 'yearly') return false
    if (quests.length > 0) return false
    if (parentQuests.length === 0) return false
    if (autoGenAttempted.current.has(timeframe)) return false
    if (autoGenerating !== null) return false
    return true
  }, [autoGenerating])

  useEffect(() => {
    for (const tf of AUTO_GEN_ORDER) {
      const quests = getQuests(tf, yearlyQuests, monthlyQuests, weeklyQuests, dailyQuests)
      const parents = getParentQuests(tf, yearlyQuests, monthlyQuests, weeklyQuests)

      if (shouldAutoGenerate(tf, quests, parents)) {
        autoGenAttempted.current.add(tf)
        setAutoGenerating(tf)

        const parentIds = parents.map((q) => q.id)

        fetch('/api/ai/generate-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questTimeframe: tf,
            generationMode: 'cascade',
            parentQuestIds: parentIds,
            locale,
          }),
        })
          .then(() => {
            router.refresh()
          })
          .catch(() => {
            // Error caught, autoGenAttempted prevents retry
          })
          .finally(() => {
            setAutoGenerating(null)
          })

        break // Only auto-gen one at a time
      }
    }
  }, [yearlyQuests, monthlyQuests, weeklyQuests, dailyQuests, shouldAutoGenerate, locale, router])

  const renderSection = (
    timeframe: QuestTimeframe,
    title: string,
    quests: Task[],
    parentQuests?: Task[],
    maxQuests?: number,
    sectionPlan?: string,
  ) => {
    if (autoGenerating === timeframe) {
      return (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 text-primary animate-spin" />
          <h3 className="font-display text-lg font-bold text-foreground">
            {tAuto('generating')}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {tAuto('generatingDescription')}
          </p>
        </div>
      )
    }

    return (
      <QuestSection
        title={title}
        timeframe={timeframe}
        quests={quests}
        parentQuests={parentQuests}
        maxQuests={maxQuests}
        plan={sectionPlan}
      />
    )
  }

  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="yearly">{t('yearly')}</TabsTrigger>
        <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>
        <TabsTrigger value="weekly">{t('weekly')}</TabsTrigger>
        <TabsTrigger value="daily">{t('daily')}</TabsTrigger>
      </TabsList>

      <TabsContent value="yearly">
        {renderSection('yearly', t('yearlyTitle'), yearlyQuests, undefined, planLimits.maxYearlyQuests, plan ?? 'free')}
      </TabsContent>

      <TabsContent value="monthly">
        {renderSection('monthly', t('monthlyTitle'), monthlyQuests, yearlyQuests)}
      </TabsContent>

      <TabsContent value="weekly">
        {renderSection('weekly', t('weeklyTitle'), weeklyQuests, monthlyQuests)}
      </TabsContent>

      <TabsContent value="daily">
        {renderSection('daily', t('dailyTitle'), dailyQuests, weeklyQuests)}
      </TabsContent>
    </Tabs>
  )
}
