'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
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
import type { Task, QuestTimeframe } from '@/lib/types'

const PARENT_TIMEFRAME: Partial<Record<QuestTimeframe, QuestTimeframe>> = {
  monthly: 'yearly',
  weekly: 'monthly',
  daily: 'weekly',
}

const TIMEFRAME_LABELS: Record<QuestTimeframe, string> = {
  yearly: 'Yearly',
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
}

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
  const [generating, setGenerating] = useState(false)
  const [goalText, setGoalText] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const parentTimeframe = PARENT_TIMEFRAME[timeframe]
  const hasParentOption = !!parentTimeframe && parentQuests.length > 0

  const handleGenerate = async (mode: 'manual' | 'from-parent') => {
    if (mode === 'manual' && !goalText.trim()) {
      setError('Please describe your goals before generating quests.')
      return
    }
    if (mode === 'from-parent' && !selectedParentId) {
      setError('Please select a parent quest.')
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
        throw new Error(data?.error || 'Failed to generate quests')
      }
      setGoalText('')
      setSelectedParentId('')
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quests')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate {TIMEFRAME_LABELS[timeframe]} Quests</DialogTitle>
          <DialogDescription>
            Create AI-powered {timeframe} quests tailored to your goals.
          </DialogDescription>
        </DialogHeader>

        {hasParentOption ? (
          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">Custom Goal</TabsTrigger>
              <TabsTrigger value="parent">
                From {TIMEFRAME_LABELS[parentTimeframe!]} Quest
              </TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="flex flex-col gap-3 mt-4">
              <Textarea
                placeholder="E.g. I want to exercise more, learn Spanish, read 20 pages daily..."
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                rows={3}
                className="resize-none"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={() => handleGenerate('manual')}
                disabled={generating}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            </TabsContent>

            <TabsContent value="parent" className="flex flex-col gap-3 mt-4">
              <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${parentTimeframe} quest`} />
                </SelectTrigger>
                <SelectContent>
                  {parentQuests.map((quest) => (
                    <SelectItem key={quest.id} value={quest.id}>
                      {quest.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={() => handleGenerate('from-parent')}
                disabled={generating}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? 'Generating...' : 'Generate from Quest'}
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col gap-3">
            <Textarea
              placeholder="E.g. I want to exercise more, learn Spanish, read 20 pages daily..."
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={() => handleGenerate('manual')}
              disabled={generating}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
