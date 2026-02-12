'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountPage() {
  const [step, setStep] = useState<'info' | 'confirm' | 'deleting' | 'done'>('info')
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setStep('deleting')
    setError('')

    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      const supabase = createClient()
      await supabase.auth.signOut()
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStep('confirm')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="glass-card rounded-2xl p-8 sm:p-12">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Delete Account</h1>

        {step === 'done' ? (
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <p className="text-lg font-semibold text-foreground">Your account has been deleted.</p>
            <p>All your data has been permanently removed. Thank you for using XPLife.</p>
            <Link href="/" className="mt-4 inline-flex w-fit rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Go to Homepage
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-2 font-display text-lg font-bold text-foreground">What happens when you delete your account</h2>
              <p>When you request account deletion, the following data will be <strong className="text-foreground">permanently removed</strong>:</p>
              <ul className="mt-3 list-disc pl-5 flex flex-col gap-1">
                <li>Your profile information (name, avatar, settings)</li>
                <li>All quests and task history</li>
                <li>Goals and interests</li>
                <li>XP, level progress, and streak data</li>
                <li>Braverman personality test results</li>
                <li>AI chat history</li>
                <li>All uploaded files (avatars, task proofs)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-display text-lg font-bold text-foreground">This action is irreversible</h2>
              <p>Once your account is deleted, there is no way to recover your data. Make sure you want to proceed before confirming.</p>
            </section>

            <section>
              <h2 className="mb-2 font-display text-lg font-bold text-foreground">Data retention</h2>
              <p>All data is deleted immediately upon confirmation. No data is retained after deletion.</p>
            </section>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
                {error}
              </div>
            )}

            {step === 'info' && (
              <button
                onClick={() => setStep('confirm')}
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                I want to delete my account
              </button>
            )}

            {step === 'confirm' && (
              <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="font-semibold text-foreground">Are you absolutely sure?</p>
                <p>This will permanently delete your account and all associated data. This cannot be undone.</p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Yes, permanently delete my account
                  </button>
                  <button
                    onClick={() => setStep('info')}
                    className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {step === 'deleting' && (
              <div className="flex items-center gap-3 text-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Deleting your account...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
