import Link from 'next/link'
import { Skull } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12 text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/20">
            <Skull className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
        <p className="mt-2 font-display text-lg text-muted-foreground">Quest Not Found</p>
        <p className="mt-4 text-sm text-muted-foreground">
          This path leads nowhere. The page you seek does not exist in this realm.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
        >
          Return to Base
        </Link>
      </div>
    </div>
  )
}
