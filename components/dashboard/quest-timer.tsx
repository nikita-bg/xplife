'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import type { QuestTimeframe } from '@/lib/types'

interface QuestTimerProps {
  timeframe: QuestTimeframe
}

function getDeadline(timeframe: QuestTimeframe): Date {
  const now = new Date()
  switch (timeframe) {
    case 'daily': {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      return end
    }
    case 'weekly': {
      const day = now.getDay()
      const daysUntilSunday = day === 0 ? 0 : 7 - day
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59, 999)
      return end
    }
    case 'monthly': {
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return end
    }
    case 'yearly': {
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      return end
    }
  }
}

function getTotalDuration(timeframe: QuestTimeframe): number {
  switch (timeframe) {
    case 'daily':
      return 24 * 60 * 60 * 1000
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000
    case 'yearly':
      return 365 * 24 * 60 * 60 * 1000
  }
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'Expired'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return hours % 24 > 0 ? `${days}d ${hours % 24}h` : `${days}d`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}m`
}

function getColorClass(percentRemaining: number): string {
  if (percentRemaining > 50) return 'text-green-400'
  if (percentRemaining > 25) return 'text-yellow-400'
  if (percentRemaining > 10) return 'text-orange-400'
  return 'text-red-400 animate-pulse'
}

export function QuestTimer({ timeframe }: QuestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const deadline = getDeadline(timeframe)
    return deadline.getTime() - Date.now()
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = getDeadline(timeframe)
      setTimeLeft(deadline.getTime() - Date.now())
    }, 60_000)

    return () => clearInterval(interval)
  }, [timeframe])

  const totalDuration = getTotalDuration(timeframe)
  const percentRemaining = Math.max(0, (timeLeft / totalDuration) * 100)
  const colorClass = getColorClass(percentRemaining)

  return (
    <span className={`flex items-center gap-1 text-xs ${colorClass}`}>
      <Clock className="h-3 w-3" />
      {formatTimeLeft(timeLeft)}
    </span>
  )
}
