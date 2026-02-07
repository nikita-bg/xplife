'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestSection } from './quest-section'
import { getPlanLimits } from '@/lib/plan-limits'
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

  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="yearly">Yearly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="daily">Daily</TabsTrigger>
      </TabsList>

      <TabsContent value="yearly">
        <QuestSection
          title="Yearly Goals"
          timeframe="yearly"
          quests={yearlyQuests}
          maxQuests={planLimits.maxYearlyQuests}
          plan={plan ?? 'free'}
        />
      </TabsContent>

      <TabsContent value="monthly">
        <QuestSection
          title="Monthly Milestones"
          timeframe="monthly"
          quests={monthlyQuests}
          parentQuests={yearlyQuests}
        />
      </TabsContent>

      <TabsContent value="weekly">
        <QuestSection
          title="Weekly Targets"
          timeframe="weekly"
          quests={weeklyQuests}
          parentQuests={monthlyQuests}
        />
      </TabsContent>

      <TabsContent value="daily">
        <QuestSection
          title="Today's Quests"
          timeframe="daily"
          quests={dailyQuests}
          parentQuests={weeklyQuests}
        />
      </TabsContent>
    </Tabs>
  )
}
