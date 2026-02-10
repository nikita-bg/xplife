'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Sparkles, AlertCircle, ArrowUpRight, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import type { Task, QuestTimeframe } from '@/lib/types'

const PARENT_TIMEFRAME: Partial<Record<QuestTimeframe, QuestTimeframe>> = {
  monthly: 'yearly',
  weekly: 'monthly',
  daily: 'weekly',
}

const CASCADE_STEPS: QuestTimeframe[] = ['monthly', 'weekly', 'daily']

interface CascadeResults {
  yearly: number
  monthly: number
  weekly: number
  daily: number
}

type CascadeStep = QuestTimeframe | 'done' | null

interface GenerateQuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeframe: QuestTimeframe
  parentQuests?: Task[]
}

export function GenerateQuestDialog({
  open,
  onOpenChange,
  timeframe,
  parentQuests = [],
}: GenerateQuestDialogProps) {
  const router = useRouter()
  const t = useTranslations('generateQuestDialog')
  const [generating, setGenerating] = useState(false)
  const [goalText, setGoalText] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [error, setError] = useState<{
    message: string
    canRetry: boolean
    showUpgrade: boolean
  } | null>(null)

  // Cascade state
  const [cascadeStep, setCascadeStep] = useState<CascadeStep>(null)
  const [cascadeResults, setCascadeResults] = useState<CascadeResults>({
    yearly: 0,
    monthly: 0,
    weekly: 0,
    daily: 0,
  })
  const [cascadeFailed, setCascadeFailed] = useState(false)

  const parentTimeframe = PARENT_TIMEFRAME[timeframe]
  const hasParentOption = !!parentTimeframe && parentQuests.length > 0
  const timeframeLabel = t(timeframe as 'yearly' | 'monthly' | 'weekly' | 'daily')
  const parentTimeframeLabel = parentTimeframe ? t(parentTimeframe as 'yearly' | 'monthly' | 'weekly' | 'daily') : ''

  const isCascading = cascadeStep !== null

  const CHILD_TIMEFRAME: Record<string, QuestTimeframe> = {
    yearly: 'monthly',
    monthly: 'weekly',
    weekly: 'daily',
  }

  async function fetchQuestsByTimeframe(tf: QuestTimeframe): Promise<Task[]> {
    const supabase = createClient()
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('quest_timeframe', tf)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    return (data as Task[]) || []
  }

  async function generateForTimeframe(
    tf: QuestTimeframe,
    parentIds: string[]
  ): Promise<number> {
    const res = await fetch('/api/ai/generate-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questTimeframe: tf,
        generationMode: 'cascade',
        parentQuestIds: parentIds,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || 'Failed to generate quests')
    }

    const data = await res.json()
    return data.count || 0
  }

  async function runCascade(yearlyCount: number) {
    const results: CascadeResults = {
      yearly: yearlyCount,
      monthly: 0,
      weekly: 0,
      daily: 0,
    }
    setCascadeResults(results)

    let currentParentTimeframe: QuestTimeframe = 'yearly'

    for (const step of CASCADE_STEPS) {
      setCascadeStep(step)

      try {
        // Fetch parent quests for this step
        const parents = await fetchQuestsByTimeframe(currentParentTimeframe)
        if (parents.length === 0) {
          // No parents found, stop cascade
          break
        }

        const parentIds = parents.map((q) => q.id)
        const count = await generateForTimeframe(step, parentIds)

        results[step] = count
        setCascadeResults({ ...results })
        currentParentTimeframe = step
      } catch {
        setCascadeFailed(true)
        setCascadeResults({ ...results })
        return
      }
    }

    setCascadeStep('done')
  }

  const handleGenerate = async (mode: 'manual' | 'from-parent') => {
    if (mode === 'manual' && !goalText.trim()) {
      setError({ message: t('emptyGoalsError'), canRetry: false, showUpgrade: false })
      return
    }
    if (mode === 'from-parent' && !selectedParentId) {
      setError({ message: t('selectParentError'), canRetry: false, showUpgrade: false })
      return
    }

    setError(null)
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals: mode === 'manual' ? goalText.trim() : undefined,
          questTimeframe: timeframe,
          generationMode: mode,
          parentQuestId: mode === 'from-parent' ? selectedParentId : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const errorMessage = data?.error || t('generateError')

        if (res.status === 429 || errorMessage.toLowerCase().includes('limit')) {
          setError({ message: errorMessage, canRetry: false, showUpgrade: true })
        } else {
          setError({ message: errorMessage, canRetry: true, showUpgrade: false })
        }
        return
      }

      const data = await res.json()
      const count = data.count || 0

      // If yearly generation succeeded, start cascade
      if (timeframe === 'yearly' && count > 0) {
        setGenerating(false)
        await runCascade(count)
        return
      }

      setGoalText('')
      setSelectedParentId('')
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to generate quests',
        canRetry: true,
        showUpgrade: false,
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleCascadeClose = () => {
    setCascadeStep(null)
    setCascadeResults({ yearly: 0, monthly: 0, weekly: 0, daily: 0 })
    setCascadeFailed(false)
    setGoalText('')
    setSelectedParentId('')
    onOpenChange(false)
    router.refresh()
  }

  const errorBlock = error && (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-start">
        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
      <div className="flex gap-2">
        {error.canRetry && (
          <Button size="sm" variant="outline" onClick={() => handleGenerate('manual')} disabled={generating} className="h-7 text-xs">
            {t('tryAgain')}
          </Button>
        )}
        {error.showUpgrade && (
          <Link href="/pricing">
            <Button size="sm" variant="default" className="h-7 text-xs gap-1">
              {t('upgradePlan')}
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )

  // Cascade progress UI
  if (isCascading) {
    const allSteps: QuestTimeframe[] = ['yearly', 'monthly', 'weekly', 'daily']
    const currentIdx = cascadeStep === 'done' ? allSteps.length : allSteps.indexOf(cascadeStep as QuestTimeframe)

    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('title', { timeframe: timeframeLabel })}</DialogTitle>
            <DialogDescription>
              {cascadeStep === 'done'
                ? t('cascadeComplete', {
                    yearly: String(cascadeResults.yearly),
                    monthly: String(cascadeResults.monthly),
                    weekly: String(cascadeResults.weekly),
                    daily: String(cascadeResults.daily),
                  })
                : cascadeFailed
                  ? t('cascadeFailed')
                  : t('cascadeProgress', {
                      timeframe: t(cascadeStep as 'yearly' | 'monthly' | 'weekly' | 'daily'),
                    })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            {allSteps.map((step, idx) => {
              const isDone = idx < currentIdx || (cascadeStep === 'done' && idx <= allSteps.length - 1)
              const isCurrent = idx === currentIdx && cascadeStep !== 'done'
              const isPending = idx > currentIdx
              const count = cascadeResults[step]
              const stepLabel = t(step as 'yearly' | 'monthly' | 'weekly' | 'daily')

              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isDone
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : isCurrent
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {isDone ? (
                      <Check className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-muted-foreground/30' : ''}`} />
                    )}
                  </div>
                  <span className="text-sm font-medium flex-1">
                    {isDone && count > 0
                      ? t('cascadeStepDone', { timeframe: stepLabel, count: String(count) })
                      : isCurrent
                        ? t('cascadeProgress', { timeframe: stepLabel })
                        : `${stepLabel}`}
                  </span>
                </div>
              )
            })}
          </div>

          {(cascadeStep === 'done' || cascadeFailed) && (
            <Button onClick={handleCascadeClose} className="w-full gap-2">
              <Check className="h-4 w-4" />
              {t('cascadeDone')}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title', { timeframe: timeframeLabel })}</DialogTitle>
          <DialogDescription>
            {t('description', { timeframe: timeframeLabel })}
          </DialogDescription>
        </DialogHeader>

        {hasParentOption ? (
          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">{t('customGoal')}</TabsTrigger>
              <TabsTrigger value="parent">
                {t('fromQuest', { timeframe: parentTimeframeLabel })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="flex flex-col gap-3 mt-4">
              <Textarea
                placeholder={t('placeholder')}
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                rows={3}
                className="resize-none"
              />
              {errorBlock}
              <Button
                onClick={() => handleGenerate('manual')}
                disabled={generating}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? t('generating') : t('generate')}
              </Button>
            </TabsContent>

            <TabsContent value="parent" className="flex flex-col gap-3 mt-4">
              <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectQuest', { timeframe: parentTimeframeLabel })} />
                </SelectTrigger>
                <SelectContent>
                  {parentQuests.map((quest) => (
                    <SelectItem key={quest.id} value={quest.id}>
                      {quest.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorBlock}
              <Button
                onClick={() => handleGenerate('from-parent')}
                disabled={generating}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? t('generating') : t('generateFromQuest')}
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col gap-3">
            <Textarea
              placeholder={t('placeholder')}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {errorBlock}
            <Button
              onClick={() => handleGenerate('manual')}
              disabled={generating}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {generating ? t('generating') : t('generate')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
