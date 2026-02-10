import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { getPlanLimits } from '@/lib/plan-limits'

export default async function OnboardingPage({
  params,
}: {
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
    .select('onboarding_completed, plan')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect(`/${locale}/dashboard`)
  }

  const planLimits = getPlanLimits(profile?.plan)

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <OnboardingFlow userId={user.id} maxGoals={planLimits.maxGoals} />
      </div>
    </div>
  )
}
