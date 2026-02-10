'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestSection } from './quest-section'
import { getPlanLimits } from '@/lib/plan-limits'
import { useTranslations } from 'next-intl'
import type { Task } from '@/lib/types'

interface QuestsViewProps {
  yearlyQuests: Task[]
  monthlyQuests: Task[]
  weeklyQuests: Task[]
  dailyQuests: Task[]
  plan?: string
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

  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="yearly">{t('yearly')}</TabsTrigger>
        <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>
        <TabsTrigger value="weekly">{t('weekly')}</TabsTrigger>
        <TabsTrigger value="daily">{t('daily')}</TabsTrigger>
      </TabsList>

      <TabsContent value="yearly">
        <QuestSection
          title={t('yearlyTitle')}
          timeframe="yearly"
          quests={yearlyQuests}
          maxQuests={planLimits.maxYearlyQuests}
          plan={plan ?? 'free'}
        />
      </TabsContent>

      <TabsContent value="monthly">
        <QuestSection
          title={t('monthlyTitle')}
          timeframe="monthly"
          quests={monthlyQuests}
          parentQuests={yearlyQuests}
        />
      </TabsContent>

      <TabsContent value="weekly">
        <QuestSection
          title={t('weeklyTitle')}
          timeframe="weekly"
          quests={weeklyQuests}
          parentQuests={monthlyQuests}
        />
      </TabsContent>

      <TabsContent value="daily">
        <QuestSection
          title={t('dailyTitle')}
          timeframe="daily"
          quests={dailyQuests}
          parentQuests={weeklyQuests}
        />
      </TabsContent>
    </Tabs>
  )
}
