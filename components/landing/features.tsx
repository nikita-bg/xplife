import { Brain, Crosshair, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Crosshair,
    title: "AI-Powered Tasks",
    description: "Personalized daily quests based on your hormonal type and psychology. Every task is crafted to push you forward.",
    gradient: "from-primary to-primary/60",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Earn XP, maintain streaks, climb the leaderboard. Watch your real-life stats grow as you complete quests.",
    gradient: "from-accent to-accent/60",
  },
  {
    icon: Brain,
    title: "Deep Personalization",
    description: "Braverman test integration for tasks that match YOUR brain chemistry. No one-size-fits-all approach.",
    gradient: "from-primary to-accent",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-accent">
            Power-Ups
          </p>
          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Your Arsenal of <span className="gradient-text">Growth</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Everything you need to transform your daily routine into an adventure worth playing.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group glass-card rounded-2xl p-8 transition-all duration-300 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-primary-foreground`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
