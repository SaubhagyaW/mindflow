"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Determine if user is logged in
  const isLoggedIn = !!session?.user

  // Determine the home link based on authentication status
  const homeLink = isLoggedIn ? "/dashboard" : "/"

  return (
    <div className="mr-4 flex">
      <Link href={homeLink} className="mr-6 flex items-center space-x-2">
        <Image src="/assets/png ai.png" alt="MindFlow Logo" width={32} height={32} className="h-16 w-auto" />
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-blue-600 text-gray-700",
            pathname === "/dashboard" ? "text-blue-600 font-semibold" : "",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/profile"
          className={cn(
            "transition-colors hover:text-blue-600 text-gray-700",
            pathname?.startsWith("/dashboard/profile") ? "text-blue-600 font-semibold" : "",
          )}
        >
          Profile
        </Link>
      </nav>
    </div>
  )
}

