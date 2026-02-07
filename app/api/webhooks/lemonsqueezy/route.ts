import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-signature') || ''

  if (!signature || !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const eventName: string = event.meta?.event_name ?? ''
  const email: string = event.data?.attributes?.user_email ?? ''

  if (!email) {
    return NextResponse.json({ error: 'No email in payload' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Determine which plan based on the variant/product
  const variantName: string = (event.data?.attributes?.first_order_item?.variant_name ?? '').toLowerCase()
  const productName: string = (event.data?.attributes?.first_order_item?.product_name ?? '').toLowerCase()
  const orderProductName: string = (event.data?.attributes?.product_name ?? '').toLowerCase()

  const combinedName = `${variantName} ${productName} ${orderProductName}`
  const isLifetime = combinedName.includes('lifetime')

  if (eventName === 'order_created') {
    // One-time purchase (Lifetime)
    const plan = isLifetime ? 'lifetime' : 'premium'

    const { error } = await supabase
      .from('users')
      .update({ plan })
      .eq('email', email)

    if (error) {
      console.error('Failed to update plan:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }
  }

  if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
    const status: string = event.data?.attributes?.status ?? ''

    if (status === 'active') {
      const { error } = await supabase
        .from('users')
        .update({ plan: 'premium' })
        .eq('email', email)

      if (error) {
        console.error('Failed to update plan:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }
    }

    // Subscription cancelled or expired → revert to free
    if (status === 'cancelled' || status === 'expired' || status === 'unpaid') {
      const { error } = await supabase
        .from('users')
        .update({ plan: 'free' })
        .eq('email', email)

      if (error) {
        console.error('Failed to revert plan:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
