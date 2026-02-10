'use client'

import { useState } from 'react'
import Link from 'next/link'
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

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const locale = useLocale()
  const t = useTranslations('auth.signup')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/callback`,
      },
    })

    if (error) {
      // Friendlier error for already-registered emails
      if (error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('already')) {
        setError('This email is already registered. Please log in or check your inbox for a confirmation link.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Supabase returns a user with identities=[] if email already exists but is unconfirmed
    if (result?.user?.identities?.length === 0) {
      setError('This email is already registered but not confirmed. We sent a new confirmation link — check your inbox.')
      // Resend confirmation
      await supabase.auth.resend({
        type: 'signup',
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/callback`,
        },
      })
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="glass-card gradient-border rounded-2xl p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
            <Zap className="h-7 w-7 text-accent" />
          </div>
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{t('checkEmailTitle')}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('checkEmailMessage')}
        </p>
        <Link href={`/${locale}/login`} className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          {t('loginLink')}
        </Link>
      </div>
    )
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t('confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            className="bg-background/50"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('creating') : t('submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
          {t('loginLink')}
        </Link>
      </p>
    </div>
  )
}
