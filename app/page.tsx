import Header from "@/components/header"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Demo from "@/components/demo"
import Pricing from "@/components/pricing"
import Cta from "@/components/cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Demo />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}

