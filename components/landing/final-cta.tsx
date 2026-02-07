import Link from "next/link"
import { Sword } from "lucide-react"

export function FinalCTA() {
  return (
    <section id="signup" className="relative py-24 px-4">
      {/* Gradient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="glass-card gradient-border rounded-3xl px-8 py-16 sm:px-16">
          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Ready to Start Your{" "}
            <span className="gradient-text">Quest?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground leading-relaxed">
            Every day you wait is XP you&apos;ll never earn. Start your free quest today.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-10 py-4 font-bold text-primary-foreground transition-all hover:shadow-2xl hover:shadow-primary/30 hover:opacity-95"
          >
            <Sword className="h-5 w-5" />
            Start Your Quest — It&apos;s Free
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required. Free forever, upgrade anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
