/**
 * Analytics Data API Endpoint
 *
 * GET /api/analytics?metric=<metric>&range=<range>
 *
 * Admin-only endpoint for fetching analytics data for the dashboard.
 * Requires valid NextAuth admin session.
 *
 * Query Parameters:
 * - metric: overview | pages | sources | countries | recent | timeseries | devices
 * - range: 24h | 7d | 30d | 90d (default: 7d)
 *
 * Features:
 * - Session-based authentication (admin only)
 * - Multiple metrics with efficient SQL queries
 * - Time-range filtering
 * - Aggregated data for dashboard charts
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
)

/**
 * GET handler for analytics data
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth()

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Admin access required',
        },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'overview'
    const range = searchParams.get('range') || '7d'

    // Calculate start date based on range
    const startDate = getStartDate(range)

    // Route to appropriate metric handler
    let data
    switch (metric) {
      case 'overview':
        data = await getOverviewMetrics(startDate)
        break
      case 'pages':
        data = await getTopPages(startDate)
        break
      case 'sources':
        data = await getTopSources(startDate)
        break
      case 'countries':
        data = await getTopCountries(startDate)
        break
      case 'devices':
        data = await getDeviceBreakdown(startDate)
        break
      case 'recent':
        data = await getRecentActivity()
        break
      case 'timeseries':
        data = await getTimeSeries(startDate)
        break
      default:
        return NextResponse.json(
          {
            error: 'Invalid metric',
            message: `Unknown metric: ${metric}`,
          },
          { status: 400 }
        )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API] /api/analytics error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch analytics data',
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate start date from time range string
 */
function getStartDate(range: string): Date {
  const now = new Date()

  switch (range) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
}

/**
 * Get overview metrics (total views, sessions, avg views per session, top country)
 */
async function getOverviewMetrics(startDate: Date) {
  // Total page views
  const { count: totalViews } = await supabase
    .from('analytics_page_views')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())

  // Unique sessions
  const { count: uniqueSessions } = await supabase
    .from('analytics_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('first_seen_at', startDate.toISOString())

  // Average page views per session
  const avgViewsPerSession =
    totalViews && uniqueSessions ? (totalViews / uniqueSessions).toFixed(2) : '0'

  // Bounce rate (sessions with only 1 page view)
  const { count: bouncedSessions } = await supabase
    .from('analytics_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('first_seen_at', startDate.toISOString())
    .eq('page_view_count', 1)

  const bounceRate =
    bouncedSessions && uniqueSessions
      ? ((bouncedSessions / uniqueSessions) * 100).toFixed(1)
      : '0'

  // Top country
  const { data: sessions } = await supabase
    .from('analytics_sessions')
    .select('country')
    .gte('first_seen_at', startDate.toISOString())

  const countryCount: Record<string, number> = {}
  sessions?.forEach((s) => {
    if (s.country && s.country !== 'Unknown') {
      countryCount[s.country] = (countryCount[s.country] || 0) + 1
    }
  })

  const topCountry =
    Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

  return {
    totalViews: totalViews || 0,
    uniqueSessions: uniqueSessions || 0,
    avgViewsPerSession,
    bounceRate,
    topCountry,
  }
}

/**
 * Get top pages by view count
 */
async function getTopPages(startDate: Date) {
  const { data } = await supabase
    .from('analytics_page_views')
    .select('path')
    .gte('created_at', startDate.toISOString())

  if (!data) return []

  // Count page views by path
  const pathCount: Record<string, number> = {}
  data.forEach((pv) => {
    pathCount[pv.path] = (pathCount[pv.path] || 0) + 1
  })

  // Sort and return top 10
  return Object.entries(pathCount)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

/**
 * Get top traffic sources (referrers and UTM sources)
 */
async function getTopSources(startDate: Date) {
  const { data } = await supabase
    .from('analytics_sessions')
    .select('referrer, utm_source')
    .gte('first_seen_at', startDate.toISOString())

  if (!data) return []

  // Count sessions by source
  const sourceCount: Record<string, number> = {}
  data.forEach((s) => {
    const source = s.utm_source || extractDomain(s.referrer) || '(direct)'
    sourceCount[source] = (sourceCount[source] || 0) + 1
  })

  // Calculate total for percentage
  const total = Object.values(sourceCount).reduce((sum, count) => sum + count, 0)

  // Sort and return top 10
  return Object.entries(sourceCount)
    .map(([source, sessions]) => ({
      source,
      sessions,
      percentage: total > 0 ? ((sessions / total) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10)
}

/**
 * Get top countries by session count
 */
async function getTopCountries(startDate: Date) {
  const { data } = await supabase
    .from('analytics_sessions')
    .select('country')
    .gte('first_seen_at', startDate.toISOString())

  if (!data) return []

  // Count sessions by country
  const countryCount: Record<string, number> = {}
  data.forEach((s) => {
    if (s.country && s.country !== 'Unknown') {
      countryCount[s.country] = (countryCount[s.country] || 0) + 1
    }
  })

  // Calculate total for percentage
  const total = Object.values(countryCount).reduce((sum, count) => sum + count, 0)

  // Sort and return top 10
  return Object.entries(countryCount)
    .map(([country, sessions]) => ({
      country,
      sessions,
      percentage: total > 0 ? ((sessions / total) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10)
}

/**
 * Get device type breakdown (mobile, desktop, tablet, bot)
 */
async function getDeviceBreakdown(startDate: Date) {
  const { data } = await supabase
    .from('analytics_sessions')
    .select('device_type')
    .gte('first_seen_at', startDate.toISOString())

  if (!data) return []

  // Count sessions by device type
  const deviceCount: Record<string, number> = {}
  data.forEach((s) => {
    if (s.device_type) {
      deviceCount[s.device_type] = (deviceCount[s.device_type] || 0) + 1
    }
  })

  // Calculate total for percentage
  const total = Object.values(deviceCount).reduce((sum, count) => sum + count, 0)

  // Return all device types with percentage
  return Object.entries(deviceCount)
    .map(([device, sessions]) => ({
      device,
      sessions,
      percentage: total > 0 ? ((sessions / total) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.sessions - a.sessions)
}

/**
 * Get recent page views (last 20 events)
 */
async function getRecentActivity() {
  const { data } = await supabase
    .from('analytics_page_views')
    .select('id, path, country, device_type, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return data || []
}

/**
 * Get time series data (page views grouped by day)
 */
async function getTimeSeries(startDate: Date) {
  const { data } = await supabase
    .from('analytics_page_views')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (!data) return []

  // Group by day
  const dailyViews: Record<string, number> = {}
  data.forEach((pv) => {
    const date = pv.created_at.split('T')[0]
    dailyViews[date] = (dailyViews[date] || 0) + 1
  })

  // Fill in missing days with 0 views
  const result: { date: string; views: number }[] = []
  const currentDate = new Date(startDate)
  const today = new Date()

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0]
    result.push({
      date: dateStr,
      views: dailyViews[dateStr] || 0,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

/**
 * Extract domain from referrer URL
 */
function extractDomain(referrer: string | null): string | null {
  if (!referrer) return null

  try {
    const url = new URL(referrer)
    return url.hostname.replace('www.', '')
  } catch {
    return null
  }
}
