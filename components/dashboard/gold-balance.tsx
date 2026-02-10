'use client'

import { useState } from 'react'
import { Coins, Plus, Check, X } from 'lucide-react'
import { getCurrency } from '@/lib/constants/currencies'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface GoldBalanceProps {
  balance: number
  currency: string
}

export function GoldBalance({ balance: initialBalance, currency }: GoldBalanceProps) {
  const t = useTranslations('dashboard.stats')
  const router = useRouter()
  const [balance, setBalance] = useState(initialBalance)
  const [adding, setAdding] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const curr = getCurrency(currency)

  async function handleAdd() {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/balance/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value }),
      })
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance)
        setAmount('')
        setAdding(false)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card gradient-border rounded-2xl p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-muted-foreground">{t('goldBalance')}</span>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 rounded-md bg-yellow-400/10 px-2 py-0.5 text-xs font-medium text-yellow-400 transition-colors hover:bg-yellow-400/20"
          >
            <Plus className="h-3 w-3" />
            {t('add')}
          </button>
        )}
      </div>

      <p className="font-display text-2xl font-bold text-foreground">
        {curr.symbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>

      {adding && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-muted px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setAdding(false); setAmount('') }}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
