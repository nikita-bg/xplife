import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const timestamp = new Date().toISOString()
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET

  console.log(`[TEST-N8N ${timestamp}] Testing N8N connectivity`)
  console.log(`[TEST-N8N ${timestamp}] N8N_WEBHOOK_URL:`, webhookUrl ? 'CONFIGURED' : 'MISSING')
  console.log(`[TEST-N8N ${timestamp}] N8N_WEBHOOK_SECRET:`, webhookSecret ? 'CONFIGURED' : 'MISSING')

  if (!webhookUrl) {
    return NextResponse.json({
      success: false,
      error: 'N8N_WEBHOOK_URL environment variable is not configured',
      timestamp,
    })
  }

  const testPayload = {
    userId: 'test-user-id',
    personalityType: 'Explorer',
    level: 1,
    goals: [],
    recentTasks: [],
    userGoals: 'Test connectivity from Vercel',
    questTimeframe: 'daily',
    generationMode: 'manual',
    parentQuest: null,
    neurotransmitterScores: {
      dopamine: 0,
      acetylcholine: 0,
      gaba: 0,
      serotonin: 0,
    },
    taskCount: { min: 3, max: 5 },
  }

  try {
    console.log(`[TEST-N8N ${timestamp}] Attempting to fetch:`, webhookUrl)

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (webhookSecret) {
      headers['X-Webhook-Secret'] = webhookSecret
    }

    const startTime = Date.now()
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
    })
    const duration = Date.now() - startTime

    console.log(`[TEST-N8N ${timestamp}] Response received in ${duration}ms`)
    console.log(`[TEST-N8N ${timestamp}] Status:`, response.status)
    console.log(`[TEST-N8N ${timestamp}] Status Text:`, response.statusText)

    const responseText = await response.text()
    console.log(`[TEST-N8N ${timestamp}] Response body (first 500 chars):`, responseText.substring(0, 500))

    let parsedResponse = null
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      console.log(`[TEST-N8N ${timestamp}] Response is not valid JSON`)
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      hasSecret: !!webhookSecret,
      webhookUrl,
      responsePreview: responseText.substring(0, 200),
      parsedResponse: parsedResponse ? 'JSON parsed successfully' : 'Not JSON',
      headers: Object.fromEntries(response.headers.entries()),
      timestamp,
    })
  } catch (error) {
    console.error(`[TEST-N8N ${timestamp}] Error:`, error)

    const errorDetails = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorStack: error instanceof Error ? error.stack : undefined,
      webhookUrl,
      hasSecret: !!webhookSecret,
      timestamp,
    }

    console.error(`[TEST-N8N ${timestamp}] Full error details:`, errorDetails)

    return NextResponse.json(errorDetails, { status: 500 })
  }
}
