"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"

export function SiteFooter() {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  if (isAuthenticated) {
    return (
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} MindFlow. All rights reserved.</p>
        </div>
      </footer>
    )
  }

  return (
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
              <li>
                <Link href="/return-policy" className="text-blue-100 hover:text-white transition">
                  Return Policy
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
  )
}
