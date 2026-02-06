import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="glass-card rounded-2xl p-8 sm:p-12">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Privacy Policy</h1>

        <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">Data We Collect</h2>
            <p>We collect your email address, profile information you provide, quiz responses, goals, and task completion data to deliver our service.</p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">How We Use It</h2>
            <p>Your data is used to personalize your experience, generate AI-powered tasks, track your progress, and display your position on the leaderboard.</p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">Data Storage</h2>
            <p>All data is stored securely using Supabase with row-level security policies. Your data is only accessible to you unless you opt into public features like the leaderboard.</p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">Your Rights</h2>
            <p>You can request deletion of your account and all associated data at any time by contacting us.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
