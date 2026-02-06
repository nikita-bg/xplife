import { Shield } from 'lucide-react'

interface ProfileHeaderProps {
  displayName: string
  avatarUrl: string | null
  level: number
  levelTitle: string
}

export function ProfileHeader({ displayName, avatarUrl, level, levelTitle }: ProfileHeaderProps) {
  return (
    <div className="glass-card gradient-border rounded-2xl p-8 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            displayName[0]?.toUpperCase()
          )}
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold text-foreground">{displayName}</h1>

      <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1">
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-display text-sm font-bold text-primary">
          LVL {level} &middot; {levelTitle}
        </span>
      </div>
    </div>
  )
}
