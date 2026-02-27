/**
 * Analytics Tracker
 *
 * Tracks page views and user sessions without cookies for privacy-first analytics.
 * Uses hash-based session identification (IP + UserAgent + Date) to create
 * unique daily sessions without requiring cookies or localStorage.
 *
 * Features:
 * - Cookie-free tracking (GDPR-friendly)
 * - Session deduplication using SHA-256 hashing
 * - Device and browser detection via User-Agent parsing
 * - UTM parameter extraction
 * - Referrer tracking
 * - Silent error handling (never breaks the app)
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { UAParser } from 'ua-parser-js'

// Initialize Supabase client with service role key for write access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false
    }
  }
)

interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot'
  browser: string
  os: string
  browserVersion?: string
  osVersion?: string
}

interface GeoData {
  country: string
  city: string
}

/**
 * Main tracking function - called from middleware for each page request
 * Runs asynchronously without blocking the request
 */
export async function trackPageView(request: NextRequest): Promise<void> {
  try {
    // Extract request data
    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const path = request.nextUrl.pathname
    const referrer = request.headers.get('referer')

    // Extract UTM parameters
    const searchParams = request.nextUrl.searchParams
    const utmSource = searchParams.get('utm_source') || undefined
    const utmMedium = searchParams.get('utm_medium') || undefined
    const utmCampaign = searchParams.get('utm_campaign') || undefined

    // Create session hash (IP + UA + date for daily uniqueness)
    const date = new Date().toISOString().split('T')[0]
    const sessionHash = createSessionHash(ip, userAgent, date)

    // Parse device info from User-Agent
    const deviceInfo = parseUserAgent(userAgent)

    // Get geolocation data (optional - can enhance later)
    const geoData = getGeoDataFromHeaders(request)

    // Upsert session (create or update existing)
    const { data: session, error: sessionError } = await supabase
      .from('analytics_sessions')
      .upsert(
        {
          session_hash: sessionHash,
          ip_address: ip,
          user_agent: userAgent,
          country: geoData.country,
          city: geoData.city,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          referrer: referrer || null,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'session_hash',
          ignoreDuplicates: false
        }
      )
      .select('id')
      .single()

    if (sessionError) {
      console.error('[Analytics] Session upsert error:', sessionError)
      return
    }

    if (!session) {
      console.error('[Analytics] No session returned from upsert')
      return
    }

    // Insert page view
    const { error: pageViewError } = await supabase
      .from('analytics_page_views')
      .insert({
        session_id: session.id,
        path,
        query_params: Object.fromEntries(searchParams),
        referrer: referrer || null,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        device_type: deviceInfo.deviceType,
        country: geoData.country,
      })

    if (pageViewError) {
      console.error('[Analytics] Page view insert error:', pageViewError)
    }
  } catch (error) {
    // Silent fail - don't break app for analytics errors
    console.error('[Analytics] Tracking error:', error)
  }
}

/**
 * Create SHA-256 hash for session identification
 * Format: hash(IP + UserAgent + Date)
 */
function createSessionHash(ip: string, userAgent: string, date: string): string {
  const data = `${ip}:${userAgent}:${date}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Extract client IP from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
function getClientIp(request: NextRequest): string {
  // Try different headers in order of preference
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim()
  }

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp
  }

  // Fallback to request.ip (if available)
  if (request.ip) {
    return request.ip
  }

  return 'unknown'
}

/**
 * Parse User-Agent string to extract device, browser, and OS info
 * Uses ua-parser-js library for robust parsing
 */
function parseUserAgent(ua: string): DeviceInfo {
  const parser = new UAParser(ua)
  const result = parser.getResult()

  // Determine device type
  let deviceType: DeviceInfo['deviceType'] = 'desktop'

  if (result.device.type === 'mobile') {
    deviceType = 'mobile'
  } else if (result.device.type === 'tablet') {
    deviceType = 'tablet'
  } else if (/bot|crawler|spider|scraper/i.test(ua)) {
    deviceType = 'bot'
  }

  return {
    deviceType,
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    browserVersion: result.browser.version,
    osVersion: result.os.version,
  }
}

/**
 * Extract geolocation data from Vercel geo headers
 * Falls back to 'Unknown' if headers are not available
 */
function getGeoDataFromHeaders(request: NextRequest): GeoData {
  // Vercel provides geo headers automatically in production
  // https://vercel.com/docs/concepts/edge-network/headers#x-vercel-ip-country
  const country = request.headers.get('x-vercel-ip-country') || 'Unknown'
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown'

  return {
    country: decodeURIComponent(country),
    city: decodeURIComponent(city),
  }
}

/**
 * Determine if a path should be tracked
 * Skips admin routes, API routes, static assets, and auth pages
 */
export function shouldTrackAnalytics(pathname: string): boolean {
  const skipPaths = [
    '/api/',
    '/admin/',
    '/_next/',
    '/favicon.ico',
    '/icon.png',
    '/icon-512.png',
    '/og-image.png',
    '/manifest.json',
    '/sw.js',
    '/offline.html',
    '/.well-known/',
    '/login',
    '/signup',
    '/robots.txt',
    '/sitemap.xml',
  ]

  // Skip if pathname matches any skip path
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return false
  }

  // Skip static file extensions
  const staticExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.css', '.js', '.woff', '.woff2', '.ttf']
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return false
  }

  return true
}

/**
 * Clean up old analytics data (optional - can be called from cron job)
 * Deletes page views and sessions older than specified days
 */
export async function cleanupOldAnalytics(daysToKeep: number = 90): Promise<void> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    // Delete old page views (cascade will handle foreign key cleanup)
    await supabase
      .from('analytics_page_views')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    // Delete old sessions without page views
    await supabase
      .from('analytics_sessions')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    console.log(`[Analytics] Cleaned up data older than ${daysToKeep} days`)
  } catch (error) {
    console.error('[Analytics] Cleanup error:', error)
  }
}
