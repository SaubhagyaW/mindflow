import type {Metadata} from "next"
import {ServicesClient} from "./ServicesClient"

export const metadata: Metadata = {
  title: "AI Brainstorming Services | MindFlow - Voice-Powered Brainstorming AI",
  description: "Experience the most advanced brainstorming AI platform. Start voice conversations with our ChatGPT-powered assistant to transform your ideas into organized action plans.",
  alternates: {
    canonical: "https://www.mind-flow.ai/services",
  },
  openGraph: {
    title: "Professional AI Brainstorming Services | MindFlow Voice Assistant",
    description: "Transform your creative process with MindFlow's brainstorming AI.",
    url: "https://www.mind-flow.ai/services",
  },
}

export default function ServicesPage() {
  return <ServicesClient/>
}
