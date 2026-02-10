import { setRequestLocale } from 'next-intl/server'
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Pricing } from "@/components/landing/pricing"
import { SocialProof } from "@/components/landing/social-proof"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Enable static rendering
  setRequestLocale(locale)

  return (
    <main className="min-h-screen overflow-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </main>
  )
}
