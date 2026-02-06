import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      {/* Profile header skeleton */}
      <div className="glass-card gradient-border rounded-2xl p-8 text-center">
        <div className="mb-4 flex justify-center">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto mt-2 h-6 w-32" />
      </div>

      {/* Stats skeleton */}
      <div className="glass-card rounded-2xl p-6">
        <Skeleton className="mb-4 h-6 w-16" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>

      {/* Settings skeleton */}
      <div className="glass-card rounded-2xl p-6">
        <Skeleton className="mb-4 h-6 w-20" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
