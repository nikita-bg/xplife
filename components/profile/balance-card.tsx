'use client'

import { useState } from 'react'
import { Coins, Plus, Check, X, ChevronDown } from 'lucide-react'
import { CURRENCIES, getCurrency } from '@/lib/constants/currencies'
import { useRouter } from 'next/navigation'

interface BalanceCardProps {
  balance: number
  currency: string
}

export function BalanceCard({ balance: initialBalance, currency: initialCurrency }: BalanceCardProps) {
  const router = useRouter()
  const [balance, setBalance] = useState(initialBalance)
  const [currency, setCurrency] = useState(initialCurrency)
  const [adding, setAdding] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)

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

  async function handleCurrencyChange(newCurrency: string) {
    if (newCurrency === currency) {
      setCurrencyOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/balance/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency }),
      })
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance)
        setCurrency(data.currency)
        setCurrencyOpen(false)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <Coins className="h-5 w-5 text-yellow-400" />
          Gold Balance
        </h2>
        <div className="relative">
          <button
            onClick={() => setCurrencyOpen(!currencyOpen)}
            className="flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted/80"
          >
            {curr.symbol} {currency}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
          </button>
          {currencyOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 max-h-60 w-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code)}
                  disabled={loading}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    c.code === currency ? 'bg-primary/10 text-primary' : 'text-foreground'
                  }`}
                >
                  <span className="w-6 text-center font-medium">{c.symbol}</span>
                  <span>{c.code}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="font-display text-3xl font-bold text-foreground">
        {curr.symbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>

      <div className="mt-4">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 rounded-lg bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-400 transition-colors hover:bg-yellow-400/20"
          >
            <Plus className="h-4 w-4" />
            Add Earnings
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{curr.symbol}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-muted pl-7 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setAdding(false); setAmount('') }}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
