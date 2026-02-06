import { ArrowRight, ClipboardList, Sparkles, Trophy } from "lucide-react"

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Sign Up & Take Quick Quiz",
    description: "Answer a few questions about your lifestyle, goals, and brain type. It only takes 2 minutes.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Get Daily AI Tasks",
    description: "Our AI crafts personalized quests every day based on your unique profile and progress.",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Complete & Level Up",
    description: "Finish quests to earn XP, unlock achievements, and climb the global leaderboard.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="pointer-events-none absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-primary">
            Quest Guide
          </p>
          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            From signup to level-up in three simple steps.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div key={item.title} className="relative flex flex-col items-center text-center">
              {/* Connector arrow */}
              {index < steps.length - 1 && (
                <div className="pointer-events-none absolute right-0 top-12 hidden translate-x-1/2 md:block">
                  <ArrowRight className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}

              {/* Step number */}
              <div className="mb-6 relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl glass-card gradient-border">
                  <item.icon className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-accent-foreground">
                  {item.step}
                </span>
              </div>

              <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                {item.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
