import Link from "next/link"
import { Check, Crown, Zap } from "lucide-react"

const tiers = [
  {
    name: "Start Free",
    price: "$0",
    period: "forever",
    description: "14 days full access, then limited features",
    features: [
      "1 active goal",
      "3 AI-generated tasks per week",
      "Basic leaderboard access",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
    icon: Zap,
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "/month",
    description: "Full power unlocked for serious achievers",
    badge: "Most Popular",
    features: [
      "Unlimited AI tasks daily",
      "3 parallel goals",
      "Full AI coaching & insights",
      "Streak freezes (3/month)",
      "Priority leaderboard",
      "Advanced analytics",
    ],
    cta: "Upgrade Now",
    highlighted: true,
    icon: Crown,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 px-4">
      <div className="pointer-events-none absolute right-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px]" />

      <div className="mx-auto max-w-5xl">
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

        <div className="grid gap-8 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? "glass-card gradient-border shadow-2xl shadow-primary/10"
                  : "glass-card hover:bg-card/80"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-bold text-primary-foreground">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tier.highlighted ? "bg-primary/20" : "bg-muted"}`}>
                  <tier.icon className={`h-5 w-5 ${tier.highlighted ? "text-primary" : "text-muted-foreground"}`} />
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
                    <Check className={`h-4 w-4 flex-shrink-0 ${tier.highlighted ? "text-accent" : "text-primary"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${
                  tier.highlighted
                    ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:opacity-90"
                    : "border border-border bg-secondary text-secondary-foreground hover:border-primary/50"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
