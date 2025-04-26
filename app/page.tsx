"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ArrowRight, Share2, Mic,
  Save,
  FileText,
  Trash2,
  UserCircle,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <div className="flex flex-col min-h-screen bg-white ">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/assets/png ai.png" alt="MindFlow Logo" width={100} height={60} className="h-16 w-auto" />
          </div>
          <nav className="hidden md:flex items-center gap-6 -ml-2">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-blue-600 transition">
              Services
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-blue-50 py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                AI-Powered Voice Brainstorming
              </h1>
              <h1 className="text-xl md:text-xl font-bold text-gray-900 mb-6">
                Transform Ideas into Action with MindFlow
              </h1>
              <p className="text-l text-gray-600 mb-8">
                MindFlow revolutionizes creative workflows by connecting you with an intelligent ChatGPT-powered voice assistant that captures, transcribes, and organizes your spoken ideas in real-time. Unlike traditional note-taking apps or AI tools, our brainstorming platform turns natural conversations into structured action plans, helping professionals, creators, and business teams unlock breakthrough thinking without losing brilliant ideas to forgetfulness or disorganization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                    Try Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
              <Image
                src="/assets/images/hero.svg?height=500&width=500"
                alt="MindFlow in action"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              How MindFlow Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Seamless User Authentication</h3>
                <p className="text-gray-600">
                  Create your personal account with enterprise-grade security and start brainstorming in minutes with our simple profile management system.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Mic className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Natural Audio Conversations</h3>
                <p className="text-gray-600">
                  Talk naturally with your AI brainstorming partner powered by OpenAI's ChatGPT Voice for intelligent, real-time responses to develop your ideas.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Save className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Intelligent Conversation Storage</h3>
                <p className="text-gray-600">
                  Every brainstorming session is automatically transcribed and securely stored, allowing you to access your complete conversation history anytime.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Automated Note Generation</h3>
                <p className="text-gray-600">
                  Get concise bullet-point summaries and action items automatically extracted from your conversations—no manual note-taking required.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Share2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Effortless Sharing Capabilities</h3>
                <p className="text-gray-600">
                  Share notes directly via WhatsApp or Email with just a few clicks, distributing ideas and action items without disrupting your creative flow.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Trash2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Comprehensive Conversation Management</h3>
                <p className="text-gray-600">
                  Easily navigate your brainstorming history with intuitive controls to view, categorize, and delete conversations as needed.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Demo Video Section */}
        <section className="bg-blue-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">See MindFlow in Action</h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Watch how MindFlow can transform your brainstorming sessions and help you capture your best ideas.
            </p>
            <div className="relative max-w-4xl mx-auto aspect-video bg-gray-200 rounded-lg shadow-lg">
              {/* This would be replaced with an actual video player */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Transform Your Brainstorming?</h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Join thousands of users who are already using MindFlow to capture and organize their ideas.
            </p>
            <Link href="/services">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Try MindFlow Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
                  className="h-16 w-auto rounded-2xl " // Invert to make it white for dark background
                />
              </div>
              <p className="text-blue-100">AI-Powered Voice Brainstorming: Transform Ideas into Action with MindFlow</p>
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
                {/* <li>
                  <Link href="/terms" className="text-blue-100 hover:text-white transition">
                    Terms of Service
                  </Link>
                </li> */}
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

