'use client'

/**
 * Admin Dashboard - Main Analytics Interface
 *
 * Features:
 * - Real-time analytics data fetching
 * - Time range filtering (24h, 7d, 30d, 90d)
 * - Overview metrics (views, sessions, bounce rate)
 * - Top pages, sources, countries tables
 * - Time series chart
 * - Device breakdown
 * - Responsive cyberpunk design
 */

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import {
  BarChart3,
  Globe,
  Users,
  Eye,
  TrendingUp,
  LogOut,
  Monitor,
  Activity,
  RefreshCw,
  Smartphone,
  Tablet,
  Bot,
} from 'lucide-react'

// Type definitions
interface OverviewData {
  totalViews: number
  uniqueSessions: number
  avgViewsPerSession: string
  bounceRate: string
  topCountry: string
}

interface PageData {
  path: string
  views: number
}

interface SourceData {
  source: string
  sessions: number
  percentage: string
}

interface CountryData {
  country: string
  sessions: number
  percentage: string
}

interface DeviceData {
  device: string
  sessions: number
  percentage: string
}

interface TimeSeriesData {
  date: string
  views: number
}

interface RecentActivity {
  id: string
  path: string
  country: string
  device_type: string
  created_at: string
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [topPages, setTopPages] = useState<PageData[]>([])
  const [topSources, setTopSources] = useState<SourceData[]>([])
  const [topCountries, setTopCountries] = useState<CountryData[]>([])
  const [devices, setDevices] = useState<DeviceData[]>([])
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    if (!loading) setRefreshing(true)

    try {
      const [overviewRes, pagesRes, sourcesRes, countriesRes, devicesRes, timeSeriesRes, recentRes] =
        await Promise.all([
          fetch(`/api/analytics?metric=overview&range=${timeRange}`),
          fetch(`/api/analytics?metric=pages&range=${timeRange}`),
          fetch(`/api/analytics?metric=sources&range=${timeRange}`),
          fetch(`/api/analytics?metric=countries&range=${timeRange}`),
          fetch(`/api/analytics?metric=devices&range=${timeRange}`),
          fetch(`/api/analytics?metric=timeseries&range=${timeRange}`),
          fetch(`/api/analytics?metric=recent`),
        ])

      const [overviewData, pagesData, sourcesData, countriesData, devicesData, timeSeriesData, recentData] =
        await Promise.all([
          overviewRes.json(),
          pagesRes.json(),
          sourcesRes.json(),
          countriesRes.json(),
          devicesRes.json(),
          timeSeriesRes.json(),
          recentRes.json(),
        ])

      setOverview(overviewData)
      setTopPages(pagesData)
      setTopSources(sourcesData)
      setTopCountries(countriesData)
      setDevices(devicesData)
      setTimeSeries(timeSeriesData)
      setRecentActivity(recentData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-background text-ghost">
      {/* Header */}
      <header className="bg-[#0C1021] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">
              Analytics Dashboard
            </h1>
            <p className="font-data text-xs text-accent uppercase tracking-wider mt-1">
              XPLife • Self-Hosted Analytics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-xl text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span className="font-data text-sm">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={16} />
              <span className="font-data text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Time Range Selector */}
        <div className="flex gap-3 mb-8">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2.5 rounded-xl font-data text-sm uppercase tracking-wide transition-all ${
                timeRange === range
                  ? 'bg-accent text-background shadow-[0_0_20px_rgba(0,245,255,0.3)] font-bold'
                  : 'bg-[#0C1021] border border-white/10 text-ghost/60 hover:text-ghost hover:border-white/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Eye />}
            label="Total Page Views"
            value={overview?.totalViews.toLocaleString() || '0'}
            color="accent"
          />
          <StatCard
            icon={<Users />}
            label="Unique Sessions"
            value={overview?.uniqueSessions.toLocaleString() || '0'}
            color="tertiary"
          />
          <StatCard
            icon={<TrendingUp />}
            label="Avg Views/Session"
            value={overview?.avgViewsPerSession || '0'}
            color="accent-secondary"
          />
          <StatCard
            icon={<Globe />}
            label="Bounce Rate"
            value={`${overview?.bounceRate || '0'}%`}
            color="accent"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time Series Chart */}
          <div className="bg-[#0C1021] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-accent" size={24} />
              <h2 className="font-heading text-xl font-bold text-white">
                Page Views Over Time
              </h2>
            </div>
            <SimpleLineChart data={timeSeries} />
          </div>

          {/* Device Breakdown */}
          <div className="bg-[#0C1021] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="text-tertiary" size={24} />
              <h2 className="font-heading text-xl font-bold text-white">
                Device Breakdown
              </h2>
            </div>
            <DeviceChart devices={devices} />
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <div className="bg-[#0C1021] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-accent" size={24} />
              <h2 className="font-heading text-lg font-bold text-white">Top Pages</h2>
            </div>
            <div className="space-y-3">
              {topPages.length > 0 ? (
                topPages.map((page, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-background rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <span className="font-data text-sm text-ghost/80 truncate flex-1">
                      {page.path}
                    </span>
                    <span className="font-data text-sm text-accent font-bold ml-2">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-ghost/40 text-sm text-center py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Top Sources */}
          <div className="bg-[#0C1021] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-tertiary" size={24} />
              <h2 className="font-heading text-lg font-bold text-white">Top Sources</h2>
            </div>
            <div className="space-y-3">
              {topSources.length > 0 ? (
                topSources.map((source, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-background rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <span className="font-data text-sm text-ghost/80 truncate flex-1">
                      {source.source}
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-data text-sm text-tertiary font-bold">
                        {source.sessions}
                      </span>
                      <span className="font-data text-xs text-ghost/40">
                        ({source.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-ghost/40 text-sm text-center py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-[#0C1021] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-accent-secondary" size={24} />
              <h2 className="font-heading text-lg font-bold text-white">Top Countries</h2>
            </div>
            <div className="space-y-3">
              {topCountries.length > 0 ? (
                topCountries.map((country, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-background rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <span className="font-data text-sm text-ghost/80 truncate flex-1">
                      {country.country}
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-data text-sm text-accent-secondary font-bold">
                        {country.sessions}
                      </span>
                      <span className="font-data text-xs text-ghost/40">
                        ({country.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-ghost/40 text-sm text-center py-8">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-[#0C1021] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-accent" size={24} />
            <h2 className="font-heading text-xl font-bold text-white">Recent Activity</h2>
            <span className="font-data text-xs text-ghost/40">(Last 20 page views)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="font-data text-xs text-accent uppercase tracking-wider text-left pb-3">
                    Page
                  </th>
                  <th className="font-data text-xs text-accent uppercase tracking-wider text-left pb-3">
                    Country
                  </th>
                  <th className="font-data text-xs text-accent uppercase tracking-wider text-left pb-3">
                    Device
                  </th>
                  <th className="font-data text-xs text-accent uppercase tracking-wider text-left pb-3">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="font-data text-sm text-ghost/80 py-3 max-w-md truncate">
                        {activity.path}
                      </td>
                      <td className="font-data text-sm text-ghost/60 py-3">
                        {activity.country}
                      </td>
                      <td className="font-data text-sm text-ghost/60 py-3 capitalize">
                        {activity.device_type}
                      </td>
                      <td className="font-data text-sm text-ghost/40 py-3">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-ghost/40 text-sm text-center py-8">
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

// Supporting Components

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'accent' | 'tertiary' | 'accent-secondary'
}) {
  const colorClasses = {
    accent: 'text-accent border-accent/20 bg-accent/5',
    tertiary: 'text-tertiary border-tertiary/20 bg-tertiary/5',
    'accent-secondary': 'text-accent-secondary border-accent-secondary/20 bg-accent-secondary/5',
  }

  return (
    <div className="bg-[#0C1021] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
      <div className={`inline-flex p-3 rounded-xl mb-4 ${colorClasses[color]}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <p className="font-data text-xs text-ghost/60 uppercase tracking-wider mb-2">{label}</p>
      <p className="font-heading text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function SimpleLineChart({ data }: { data: TimeSeriesData[] }) {
  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-ghost/40 text-sm">No data available</div>
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1)
  const chartHeight = 200

  return (
    <div className="relative h-64">
      <svg className="w-full h-full" viewBox={`0 0 ${data.length * 40} ${chartHeight}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
          <line
            key={percent}
            x1={0}
            y1={chartHeight * percent}
            x2={data.length * 40}
            y2={chartHeight * percent}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />
        ))}

        {/* Line path */}
        <path
          d={data
            .map((d, i) => {
              const x = i * 40 + 20
              const y = chartHeight - (d.views / maxViews) * chartHeight
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            })
            .join(' ')}
          fill="none"
          stroke="#00F5FF"
          strokeWidth={2}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = i * 40 + 20
          const y = chartHeight - (d.views / maxViews) * chartHeight
          return (
            <circle key={i} cx={x} cy={y} r={3} fill="#00F5FF" className="hover:r-5 transition-all" />
          )
        })}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-ghost/40 font-data">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

function DeviceChart({ devices }: { devices: DeviceData[] }) {
  if (devices.length === 0) {
    return <div className="h-64 flex items-center justify-center text-ghost/40 text-sm">No data available</div>
  }

  const deviceIcons = {
    desktop: <Monitor size={20} />,
    mobile: <Smartphone size={20} />,
    tablet: <Tablet size={20} />,
    bot: <Bot size={20} />,
  }

  const deviceColors = {
    desktop: 'bg-accent text-background',
    mobile: 'bg-tertiary text-background',
    tablet: 'bg-accent-secondary text-background',
    bot: 'bg-ghost/20 text-ghost',
  }

  return (
    <div className="space-y-4">
      {devices.map((device) => (
        <div key={device.device} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${deviceColors[device.device as keyof typeof deviceColors] || 'bg-ghost/20 text-ghost'}`}>
                {deviceIcons[device.device as keyof typeof deviceIcons] || <Monitor size={20} />}
              </div>
              <span className="font-data text-sm text-ghost capitalize">{device.device}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-data text-sm text-white font-bold">{device.sessions}</span>
              <span className="font-data text-xs text-ghost/40">({device.percentage}%)</span>
            </div>
          </div>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden">
            <div
              className={`h-full ${deviceColors[device.device as keyof typeof deviceColors] || 'bg-ghost/20'}`}
              style={{ width: `${device.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-ghost">
      <div className="bg-[#0C1021] border-b border-white/10 px-6 py-5">
        <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#0C1021] border border-white/10 rounded-2xl p-6 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
