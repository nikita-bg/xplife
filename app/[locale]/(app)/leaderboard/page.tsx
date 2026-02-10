import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'

export default async function LeaderboardPage({
  params,
}: {
  params: { locale: string }
}) {
  setRequestLocale(params.locale)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${params.locale}/login`)

  // Fetch top 100 from leaderboard view/table
  const { data: entries } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_xp', { ascending: false })
    .limit(100)

  // Get current user's rank
  const { data: myEntry } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          <span className="gradient-text">Leaderboard</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top players competing for glory
        </p>
      </div>

      <LeaderboardTable
        entries={entries ?? []}
        currentUserId={user.id}
        myRank={myEntry?.rank}
      />
    </div>
  )
}
