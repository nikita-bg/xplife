import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNavbar } from '@/components/shared/app-navbar'
import { ChatWidget } from '@/components/chat/chat-widget'
import { setRequestLocale } from 'next-intl/server'

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

  return (
    <div className="min-h-screen">
      <AppNavbar
        displayName={profile?.display_name || user.email?.split('@')[0] || 'Hero'}
        avatarUrl={profile?.avatar_url}
        level={profile?.level || 1}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <ChatWidget userId={user.id} />
    </div>
  )
}
