import type { Metadata } from "next"
import PricingClientPage from "./PricingClientPage"

export const metadata: Metadata = {
  title: "MindFlow - Pricing",
  description: "Choose the right plan for your brainstorming needs",
}

export default function PricingPage() {
  return <PricingClientPage />
}

