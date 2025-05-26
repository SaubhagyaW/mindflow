import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "About MindFlow",
  description: "Learn about MindFlow's mission, team, and story",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SiteHeader />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-blue-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Mission</h1>
              <p className="text-xl text-gray-600 mb-8">
                At MindFlow, we're on a mission to transform how people capture, organize, and share their ideas through
                the power of AI-assisted conversations.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="prose max-w-none text-gray-700">
                <p>
                  MindFlow was founded in 2023 by a team of AI enthusiasts and productivity experts who recognized a
                  common problem: brilliant ideas often get lost in the chaos of daily life. We saw how people struggled
                  to capture their thoughts effectively during brainstorming sessions, and how difficult it was to
                  transform those raw ideas into actionable plans.
                </p>
                <p>
                  Our solution was to create an AI-powered conversation platform that could not only capture your
                  thoughts but help organize them into clear, structured notes with actionable items. By combining
                  cutting-edge AI technology with intuitive design, we've created a tool that makes brainstorming more
                  productive and ensures no great idea gets lost.
                </p>
                <p>
                  Today, MindFlow is used by thousands of professionals, from entrepreneurs and product managers to
                  writers and researchers, all looking to streamline their ideation process and turn inspiration into
                  action.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Our Values</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Innovation</h3>
                  <p className="text-gray-700">
                    We're constantly pushing the boundaries of what's possible with AI to create more intuitive and
                    helpful tools for our users.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Accessibility</h3>
                  <p className="text-gray-700">
                    We believe powerful tools should be accessible to everyone, which is why we offer a free tier and
                    focus on intuitive design.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Privacy</h3>
                  <p className="text-gray-700">
                    Your ideas are yours. We're committed to maintaining the highest standards of data privacy and
                    security.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">User-Centered</h3>
                  <p className="text-gray-700">
                    Everything we build starts with our users' needs. We're constantly gathering feedback to improve our
                    platform.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Our Team</h2>
              <div className="prose max-w-none text-gray-700">
                <p>
                  MindFlow is built by a diverse team of AI researchers, software engineers, UX designers, and
                  productivity experts. We're united by our passion for creating tools that help people think better and
                  work smarter.
                </p>
                <p>
                  Our team is distributed across the globe, bringing together different perspectives and expertise to
                  create a product that works for everyone, regardless of their background or work style.
                </p>
              </div>

              <div className="mt-12">
                <Link href="/">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
