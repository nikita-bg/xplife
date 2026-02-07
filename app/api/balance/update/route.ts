import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let amount: number
  try {
    const body = await request.json()
    amount = Number(body.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('gold_balance')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const newBalance = Math.round(((profile.gold_balance ?? 0) + amount) * 100) / 100

  const { error } = await supabase
    .from('users')
    .update({ gold_balance: newBalance })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
  }

  return NextResponse.json({ balance: newBalance })
}
