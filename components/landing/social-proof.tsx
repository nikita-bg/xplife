import { Star, Users } from "lucide-react"

const testimonials = [
  {
    name: "Alex K.",
    role: "Software Engineer",
    avatar: "AK",
    quote: "I've tried every productivity app out there. XPLife is the first one that actually made me stick to my habits. The RPG mechanics are genius.",
    level: 28,
  },
  {
    name: "Priya M.",
    role: "Student",
    avatar: "PM",
    quote: "The AI tasks are scarily accurate. It's like having a life coach that actually understands how my brain works. Hit a 60-day streak!",
    level: 35,
  },
  {
    name: "Jordan T.",
    role: "Freelancer",
    avatar: "JT",
    quote: "Competing with friends on the leaderboard turned my lazy mornings into productive power hours. Up 3 levels this month alone.",
    level: 19,
  },
]

export function SocialProof() {
  return (
    <section className="relative py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Join 1,000+ people leveling up their lives</span>
          </div>
          <h2 className="text-balance font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Player <span className="gradient-text">Reviews</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="glass-card rounded-2xl p-6 transition-all duration-300 hover:bg-card/80"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={`star-${testimonial.name}-${i}`} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {`"${testimonial.quote}"`}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-xs font-bold text-primary-foreground">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <span className="rounded-lg bg-primary/10 px-2 py-1 font-display text-xs font-bold text-primary">
                  LVL {testimonial.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
