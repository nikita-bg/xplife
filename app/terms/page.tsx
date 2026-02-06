import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="glass-card rounded-2xl p-8 sm:p-12">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Terms of Service</h1>

        <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">Acceptance</h2>
            <p>By using XPLife, you agree to these terms. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">Account</h2>
            <p>You are responsible for maintaining the security of your account. You must provide accurate information when creating your account.</p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">Acceptable Use</h2>
            <p>You agree not to misuse the service, manipulate the leaderboard, or use automated tools to interact with the platform.</p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">Service Changes</h2>
            <p>We reserve the right to modify or discontinue features at any time. We will provide reasonable notice for significant changes.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
