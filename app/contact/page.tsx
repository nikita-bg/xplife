import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
            <Mail className="h-7 w-7 text-primary" />
          </div>
        </div>

        <h1 className="mb-4 font-display text-3xl font-bold text-foreground">Contact Us</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Have questions, feedback, or need help? Reach out to us.
        </p>

        <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-6 py-3">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">support@xplife.app</span>
        </div>
      </div>
    </div>
  )
}
