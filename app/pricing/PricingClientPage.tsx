"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, } from "lucide-react"
import Image from "next/image"

export default function PricingClientPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/png ai.png" alt="MindFlow Logo" width={100} height={60} className="h-16 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            {/* <Link href="/services" className="text-gray-700 hover:text-blue-600 transition">
              Services
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Dashboard
            </Link> */}
          </nav>
          {/* <div className="flex items-center gap-4">
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
          </div> */}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your brainstorming needs, whether you're an individual or part of a team.
          </p>
        </div>

        <PricingToggle />

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Need a custom plan?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Contact us for custom enterprise solutions tailored to your organization's specific needs.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Contact Sales
            </Button>
          </Link>
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-100">&copy; {new Date().getFullYear()} MindFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function PricingToggle() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-3 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setIsAnnual(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isAnnual ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setIsAnnual(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isAnnual ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Annual <span className="text-green-600 font-medium">Save up to 21%</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Free</h2>
            <p className="text-gray-600 mb-4">Try MindFlow with limited features</p>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>
            <Link href="/sign-up">
              <Button variant="outline" className="w-full mb-6 border-blue-600 text-blue-600 hover:bg-blue-50">
                Get Started
              </Button>
            </Link>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Real-time audio conversations with AI assistant</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Basic conversation transcription</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Up to 3 saved conversations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Automated note generation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Action item extraction</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-600 overflow-hidden relative">
          <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">CURRENTLY AVAILABLE</div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Pro</h2>
            <p className="text-gray-600 mb-4">For individual brainstormers</p>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold text-gray-900">${isAnnual ? "15" : "19"}</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>
            {isAnnual && (
              <div className="mb-6 text-sm text-green-600 font-medium">
                Billed annually (${15 * 12}/year) - Save $48/year
              </div>
            )}
            <Link href="/sign-up">
              <Button className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </Link>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Real-time audio conversations with AI assistant</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Basic conversation transcription</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited conversations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Automated note generation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Action item extraction</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Note sharing via Email</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Manage conversations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden relative">
          <div className="bg-gray-200 text-gray-600 text-center py-2 text-sm font-medium">COMING SOON</div>
          <div className="p-6 opacity-75">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Enterprise</h2>
            <p className="text-gray-600 mb-4">For teams and collaboration</p>
            {/* <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold text-gray-900">${isAnnual ? "20" : "30"}</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>
            {isAnnual && (
              <div className="mb-6 text-sm text-green-600 font-medium">
                Billed annually (${20 * 12}/year) - Save $120/year
              </div>
            )} */}
            <Button disabled variant="outline" className="w-full mb-6 text-gray-500">
              Coming Soon
            </Button>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Everything in Pro Plan</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Team collaboration workspace</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Shared conversation spaces</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Team note sharing</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Comment system on conversations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Project management tools</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">Team notifications system</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

