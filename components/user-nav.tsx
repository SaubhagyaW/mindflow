"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Mail, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UserNav() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { toast } = useToast()
  const [userData, setUserData] = useState({
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    isVerified: session?.user?.isVerified || false,
  })

  // Fetch user data directly from the database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            const isVerified = data.user.isVerified || false

            setUserData({
              name: data.user.name || "User",
              email: data.user.email || "user@example.com",
              isVerified: isVerified,
            })

            // Update session if verification status has changed
            if (isVerified !== session.user.isVerified) {
              await update({ isVerified })
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session, update])

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!userData.name || userData.name === "User") return "U"
    return userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const handleResendVerification = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session?.user?.email,
        }),
      })

      if (response.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox and click the verification link.",
        })
      } else {
        toast({
          title: "Failed to send verification email",
          description: "Please try again later or contact support.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending verification email:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
            {userData.isVerified ? (
              <div className="flex items-center text-xs text-green-600 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Email verified
              </div>
            ) : (
              <div className="flex items-center text-xs text-amber-600 mt-1">
                <Mail className="h-3 w-3 mr-1" />
                Email not verified
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          {!userData.isVerified && (
            <DropdownMenuItem onClick={handleResendVerification}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Verify Email</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
