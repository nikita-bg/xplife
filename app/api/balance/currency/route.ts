import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CURRENCIES, convertCurrency } from '@/lib/constants/currencies'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let currency: string
  try {
    const body = await request.json()
    currency = body.currency
    if (!CURRENCIES.some(c => c.code === currency)) {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('gold_balance, preferred_currency')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const oldCurrency = profile.preferred_currency ?? 'EUR'
  const oldBalance = profile.gold_balance ?? 0
  const newBalance = convertCurrency(oldBalance, oldCurrency, currency)

  const { error } = await supabase
    .from('users')
    .update({ gold_balance: newBalance, preferred_currency: currency })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 })
  }

  return NextResponse.json({ balance: newBalance, currency })
}
