"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"

export function SiteHeader() {
  const router = useRouter()
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/assets/png ai.png" alt="MindFlow Logo" width={100} height={60} className="h-16 w-auto" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 -ml-2">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">
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
              <UserNav />
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
  )
}
