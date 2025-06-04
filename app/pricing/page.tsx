import {SiteHeader} from "@/components/site-header"
import {SiteFooter} from "@/components/site-footer"
import {PricingClientPage} from "./PricingClientPage"

export const metadata: Metadata = {
    title: "Pricing - MindFlow",
    description: "Choose the right plan for your needs",
    alternates: {
        canonical: "https://www.mind-flow.ai/pricing",
    },
    openGraph: {
        title: "MindFlow Pricing - Choose Your Plan",
        description: "Flexible pricing plans for individuals and teams. Start free and upgrade as you grow.",
        url: "https://www.mind-flow.ai/pricing",
    },
}

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-24">
        <PricingClientPage />
      </main>
      <SiteFooter />
    </>
  )
}
