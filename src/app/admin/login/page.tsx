'use client'

/**
 * Admin Login Page
 *
 * Features:
 * - Cyberpunk-themed login form matching XPLife design system
 * - NextAuth credentials authentication
 * - Error handling and loading states
 * - Redirect to dashboard on success
 * - Callback URL support for deep linking
 */

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials. Please check your email and password.')
        setLoading(false)
      } else {
        // Successful login - redirect to callback URL
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-[#0C1021] border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo/Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent via-tertiary to-accent-secondary flex items-center justify-center shadow-[0_0_30px_rgba(0,245,255,0.3)]">
              <Lock size={36} className="text-background" strokeWidth={2.5} />
            </div>
          </div>

          {/* Header */}
          <h1 className="font-heading text-3xl font-bold text-center text-white mb-2">
            Admin Access
          </h1>
          <p className="font-data text-xs text-accent uppercase tracking-wider text-center mb-8">
            XPLife Analytics Dashboard
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="font-data text-xs text-accent uppercase tracking-wider block mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-ghost placeholder:text-ghost/40 focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(0,245,255,0.2)] transition-all"
                placeholder="admin@xplife.app"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="font-data text-xs text-accent uppercase tracking-wider block mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-ghost placeholder:text-ghost/40 focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(0,245,255,0.2)] transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-accent via-tertiary to-accent-secondary text-background font-heading font-bold text-lg rounded-xl hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="font-data text-xs text-ghost/40 text-center">
              Authorized personnel only
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="font-data text-xs text-ghost/30 tracking-wide">
            Secured with NextAuth v5 • Session expires after 24 hours
          </p>
        </div>
      </div>
    </div>
  )
}
