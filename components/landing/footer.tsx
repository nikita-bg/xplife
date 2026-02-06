import Link from "next/link"
import { Github, Instagram, Twitter, Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 px-4">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            XPLife
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            About
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Twitter">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="GitHub">
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-border/50 pt-8 text-center">
        <p className="text-xs text-muted-foreground">
          {"© 2026 XPLife. Built for achievers."}
        </p>
      </div>
    </footer>
  )
}
