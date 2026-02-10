'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SocialLoginButtons } from './social-login-buttons'
import { useTranslations, useLocale } from 'next-intl'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth.login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      if (error.message.toLowerCase().includes('not confirmed') || error.message.toLowerCase().includes('email not confirmed')) {
        setNeedsConfirmation(true)
        setPendingEmail(data.email)
        setError(t('emailNotConfirmed'))
      } else {
        setError(t('invalidCredentials'))
      }
      setLoading(false)
      return
    }

    router.push(`/${locale}/dashboard`)
    router.refresh()
  }

  return (
    <div className="glass-card gradient-border rounded-2xl p-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <SocialLoginButtons />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            {...register('email')}
            className="bg-background/50"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
            className="bg-background/50"
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <p>{error}</p>
            {needsConfirmation && (
              <button
                type="button"
                disabled={resending || resent}
                onClick={async () => {
                  setResending(true)
                  const supabase = createClient()
                  await supabase.auth.resend({
                    type: 'signup',
                    email: pendingEmail,
                    options: {
                      emailRedirectTo: `${window.location.origin}/${locale}/callback`,
                    },
                  })
                  setResending(false)
                  setResent(true)
                }}
                className="mt-2 font-medium underline hover:no-underline disabled:opacity-50"
              >
                {resent ? 'Confirmation link sent!' : resending ? 'Sending...' : 'Resend confirmation email'}
              </button>
            )}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('loggingIn') : t('submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/signup`} className="font-medium text-primary hover:underline">
          {t('signupLink')}
        </Link>
      </p>
    </div>
  )
}
