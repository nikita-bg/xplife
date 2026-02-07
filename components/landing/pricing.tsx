import Link from "next/link"
import Script from "next/script"
import { Check, Crown, Zap, Gem } from "lucide-react"
import { PLANS } from "@/lib/constants/pricing"

const tiers = [
  {
    name: "Start Free",
    price: "€0",
    period: "forever",
    description: "Get started with the basics",
    features: PLANS.free.features,
    cta: "Get Started Free",
    href: "/signup",
    highlighted: false,
    accent: "default" as const,
    icon: Zap,
  },
  {
    name: "Premium",
    price: "€4.99",
    period: "/month",
    description: "Full power unlocked for serious achievers",
    badge: "Most Popular",
    features: PLANS.premium.features,
    cta: "Upgrade Now",
    href: PLANS.premium.checkoutUrl,
    highlighted: true,
    accent: "default" as const,
    icon: Crown,
  },
  {
    name: "Lifetime",
    price: "€49",
    period: "one-time",
    description: "Everything in Premium, forever",
    badge: "Limited Offer",
    features: PLANS.lifetime.features,
    cta: "Claim Your Spot",
    href: PLANS.lifetime.checkoutUrl,
    highlighted: false,
    accent: "gold" as const,
    icon: Gem,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 px-4">
      <div className="pointer-events-none absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-accent">
            Choose Your Path
          </p>
          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Select Your <span className="gradient-text">Class</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Start free and upgrade when you are ready for the full experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? "glass-card gradient-border shadow-2xl shadow-primary/10"
                  : tier.accent === "gold"
                    ? "glass-card border border-amber-500/30 shadow-lg shadow-amber-500/5 hover:border-amber-500/50"
                    : "glass-card hover:bg-card/80"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`rounded-full px-4 py-1 text-xs font-bold ${
                      tier.accent === "gold"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black"
                        : "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    tier.highlighted
                      ? "bg-primary/20"
                      : tier.accent === "gold"
                        ? "bg-amber-500/20"
                        : "bg-muted"
                  }`}
                >
                  <tier.icon
                    className={`h-5 w-5 ${
                      tier.highlighted
                        ? "text-primary"
                        : tier.accent === "gold"
                          ? "text-amber-400"
                          : "text-muted-foreground"
                    }`}
                  />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{tier.name}</h3>
              </div>

              <div className="mb-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">{tier.description}</p>

              <ul className="mb-8 flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                    <Check
                      className={`h-4 w-4 flex-shrink-0 ${
                        tier.highlighted
                          ? "text-accent"
                          : tier.accent === "gold"
                            ? "text-amber-400"
                            : "text-primary"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {tier.href.startsWith("http") ? (
                <a
                  href={`${tier.href}?embed=1`}
                  className={`lemonsqueezy-button block w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:opacity-90"
                      : tier.accent === "gold"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:shadow-lg hover:shadow-amber-500/25 hover:opacity-90"
                        : "border border-border bg-secondary text-secondary-foreground hover:border-primary/50"
                  }`}
                >
                  {tier.cta}
                </a>
              ) : (
                <Link
                  href={tier.href}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:opacity-90"
                      : tier.accent === "gold"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:shadow-lg hover:shadow-amber-500/25 hover:opacity-90"
                        : "border border-border bg-secondary text-secondary-foreground hover:border-primary/50"
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="lazyOnload" />
    </section>
  )
}
