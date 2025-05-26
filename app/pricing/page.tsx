import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PricingClientPage } from "./PricingClientPage"

export const metadata = {
  title: "Pricing - MindFlow",
  description: "Choose the right plan for your needs",
}

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PricingClientPage />
      </main>
      <SiteFooter />
    </>
  )
}
