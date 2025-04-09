import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "About MindFlow",
  description: "Learn about MindFlow's mission, team, and story",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/png ai.png" alt="MindFlow Logo" width={40} height={40} className="h-16 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/about" className="text-blue-600 font-medium">
              About
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-blue-600 transition">
              Services
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="hidden md:inline-flex border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
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

      <footer className="bg-blue-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/assets/png ai.png"
                  alt="MindFlow Logo"
                  width={24}
                  height={24}
                  className="h-16 w-auto rounded-2xl"
                />
              </div>
              <p className="text-blue-100">AI-powered brainstorming to capture, organize, and share your ideas.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/services" className="text-blue-100 hover:text-white transition">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-blue-100 hover:text-white transition">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-blue-100 hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-blue-100 hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-blue-100 hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-blue-100 hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-700 mt-12 pt-8 text-center text-blue-100">
            <p>&copy; {new Date().getFullYear()} MindFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
