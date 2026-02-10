import { Skeleton } from '@/components/ui/skeleton'

export default function LeaderboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-1 h-5 w-64" />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/30 px-4 py-3">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
