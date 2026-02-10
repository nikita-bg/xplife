import { setRequestLocale } from 'next-intl/server'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  return <LoginForm />
}
