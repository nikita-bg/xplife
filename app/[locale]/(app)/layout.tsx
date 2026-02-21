import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UnifiedNavbar } from '@/components/shared/UnifiedNavbar'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
import { ChatWidget } from '@/components/chat/chat-widget'
import { Toaster } from '@/components/ui/sonner'
import { setRequestLocale } from 'next-intl/server'
import { getRankFromLevel } from '@/lib/xpUtils'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const level = profile?.level || 1
  const rank = getRankFromLevel(level)

  const navbarUser = {
    avatar: profile?.avatar_url,
    username: profile?.display_name || user.email?.split('@')[0] || 'Hero',
    totalXP: profile?.total_xp || 0,
    rank,
    level,
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <ParticleBackground />
      <UnifiedNavbar user={navbarUser} locale={locale} />
      <main style={{ paddingTop: '64px', position: 'relative', zIndex: 10 }}>
        {children}
      </main>
      <ChatWidget userId={user.id} />
      <Toaster position="bottom-right" />
    </div>
  )
}
