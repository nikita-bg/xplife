import { setRequestLocale } from 'next-intl/server'
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  return <SignupForm />
}
