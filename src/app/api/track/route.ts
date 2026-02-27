/**
 * Analytics Tracking API Endpoint
 *
 * POST /api/track
 *
 * Public endpoint for client-side analytics tracking (optional fallback).
 * Primary tracking happens via middleware, but this endpoint can be used for:
 * - Client-side event tracking (button clicks, form submissions)
 * - Single Page Application (SPA) page view tracking
 * - Custom events from client-side JavaScript
 *
 * Features:
 * - Rate limited (30 requests per minute per IP)
 * - CORS enabled for cross-origin requests
 * - Returns rate limit headers
 * - Validates request data
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/analytics/rate-limiter'
import { trackPageView } from '@/lib/analytics/tracker'

/**
 * Handle POST requests for analytics tracking
 */
export async function POST(request: NextRequest) {
  try {
    // Extract client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'

    // Check rate limit (30 requests per minute)
    const rateLimitResult = await checkRateLimit(ip, '/api/track')
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          resetAt: rateLimitResult.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      )
    }

    // Track the page view (same logic as middleware)
    await trackPageView(request)

    // Return success response with rate limit headers
    return NextResponse.json(
      {
        success: true,
        message: 'Analytics event tracked successfully',
      },
      {
        status: 200,
        headers: rateLimitHeaders,
      }
    )
  } catch (error) {
    console.error('[API] /api/track error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to track analytics event',
      },
      {
        status: 500,
      }
    )
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    }
  )
}

/**
 * Reject all other HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests',
    },
    {
      status: 405,
      headers: {
        Allow: 'POST, OPTIONS',
      },
    }
  )
}
