/**
 * Rate Limiter
 *
 * PostgreSQL-based rate limiting using sliding window algorithm.
 * Alternative to Redis/Upstash for simple deployments without external dependencies.
 *
 * Features:
 * - Sliding window rate limiting (30 requests per minute by default)
 * - Per-IP tracking using analytics_rate_limits table
 * - Automatic cleanup of old records
 * - Returns rate limit headers (Limit, Remaining, Reset)
 * - Fail-open pattern (allows requests if rate limiting fails)
 *
 * Usage:
 * const { allowed, remaining, resetAt } = await checkRateLimit(ip)
 * if (!allowed) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false
    }
  }
)

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 30 // Maximum requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute window

export interface RateLimitResult {
  allowed: boolean      // Whether the request should be allowed
  remaining: number     // Remaining requests in the current window
  resetAt: Date        // When the rate limit window resets
  limit: number        // Maximum requests allowed per window
}

/**
 * Check if an IP address has exceeded the rate limit
 * Uses sliding window algorithm with PostgreSQL as storage
 *
 * @param ip - Client IP address
 * @param endpoint - API endpoint being accessed (default: '/api/track')
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  ip: string,
  endpoint: string = '/api/track'
): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS)

  try {
    // Periodic cleanup: Delete rate limit records older than 2 hours
    // This runs on every 10th request to avoid excessive deletions
    if (Math.random() < 0.1) {
      await cleanupOldRateLimits()
    }

    // Query existing rate limit record for this IP + endpoint within the window
    const { data: existingRecords, error: queryError } = await supabase
      .from('analytics_rate_limits')
      .select('*')
      .eq('ip_address', ip)
      .eq('endpoint', endpoint)
      .gte('window_end', windowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (queryError) {
      console.error('[Rate Limit] Query error:', queryError)
      // Fail open - allow request if there's an error
      return createAllowedResult(now)
    }

    // Case 1: Existing rate limit record found
    if (existingRecords && existingRecords.length > 0) {
      const record = existingRecords[0]
      const requestCount = record.request_count

      // Check if limit exceeded
      if (requestCount >= RATE_LIMIT_MAX_REQUESTS) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(new Date(record.window_start).getTime() + RATE_LIMIT_WINDOW_MS),
          limit: RATE_LIMIT_MAX_REQUESTS,
        }
      }

      // Increment counter
      const { error: updateError } = await supabase
        .from('analytics_rate_limits')
        .update({
          request_count: requestCount + 1,
          updated_at: now.toISOString(),
        })
        .eq('id', record.id)

      if (updateError) {
        console.error('[Rate Limit] Update error:', updateError)
        // Fail open
        return createAllowedResult(now)
      }

      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS - requestCount - 1,
        resetAt: new Date(new Date(record.window_start).getTime() + RATE_LIMIT_WINDOW_MS),
        limit: RATE_LIMIT_MAX_REQUESTS,
      }
    }

    // Case 2: No existing record - create new rate limit entry
    const windowEnd = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)

    const { error: insertError } = await supabase
      .from('analytics_rate_limits')
      .insert({
        ip_address: ip,
        endpoint,
        request_count: 1,
        window_start: now.toISOString(),
        window_end: windowEnd.toISOString(),
      })

    if (insertError) {
      // Handle unique constraint violation (race condition)
      if (insertError.code === '23505') {
        // Another request created the record, retry the check
        return checkRateLimit(ip, endpoint)
      }

      console.error('[Rate Limit] Insert error:', insertError)
      // Fail open
      return createAllowedResult(now)
    }

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: windowEnd,
      limit: RATE_LIMIT_MAX_REQUESTS,
    }
  } catch (error) {
    console.error('[Rate Limit] Unexpected error:', error)
    // Fail open - allow request if rate limiting system fails
    return createAllowedResult(now)
  }
}

/**
 * Clean up rate limit records older than 2 hours
 * Called periodically (10% of requests) to prevent table bloat
 */
async function cleanupOldRateLimits(): Promise<void> {
  try {
    const cutoffTime = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago

    const { error } = await supabase
      .from('analytics_rate_limits')
      .delete()
      .lt('window_end', cutoffTime.toISOString())

    if (error) {
      console.error('[Rate Limit] Cleanup error:', error)
    }
  } catch (error) {
    console.error('[Rate Limit] Cleanup exception:', error)
  }
}

/**
 * Create a default "allowed" result for fail-open scenarios
 */
function createAllowedResult(now: Date): RateLimitResult {
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS,
    resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS),
    limit: RATE_LIMIT_MAX_REQUESTS,
  }
}

/**
 * Get rate limit headers for HTTP responses
 * Follows standard rate limit header conventions
 *
 * @param result - RateLimitResult from checkRateLimit()
 * @returns Object with X-RateLimit headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
    ...(result.allowed
      ? {}
      : {
          'Retry-After': Math.ceil(
            (result.resetAt.getTime() - Date.now()) / 1000
          ).toString(),
        }),
  }
}

/**
 * Manual cleanup function (can be called from cron job or admin panel)
 * Deletes ALL old rate limit records
 */
export async function manualCleanupRateLimits(hoursToKeep: number = 2): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - hoursToKeep * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('analytics_rate_limits')
      .delete()
      .lt('window_end', cutoffTime.toISOString())
      .select('id')

    if (error) {
      console.error('[Rate Limit] Manual cleanup error:', error)
      return 0
    }

    const deletedCount = data?.length || 0
    console.log(`[Rate Limit] Manually cleaned up ${deletedCount} old records`)
    return deletedCount
  } catch (error) {
    console.error('[Rate Limit] Manual cleanup exception:', error)
    return 0
  }
}
