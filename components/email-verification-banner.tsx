"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmailVerificationBanner() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check verification status from the database
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        console.log("Checking verification status for user:", session.user.id)
        const response = await fetch("/api/user/profile", {
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Profile data received:", data)

          if (data.user && data.user.hasAcceptedTerms !== undefined) {
            // Use hasAcceptedTerms as the verification indicator since that's what's in the schema
            const userIsVerified = data.user.hasAcceptedTerms
            console.log("User verification status from DB:", userIsVerified)
            setIsVerified(userIsVerified)

            // Update session to reflect verified status
            if (userIsVerified && !session.user.isVerified) {
            await update({ isVerified: true })
            }
          } else {
            console.log("User verification data not found, assuming not verified")
            setIsVerified(false)
          }
        }
      } catch (error) {
        console.error("Error checking verification status:", error)
        setIsVerified(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkVerificationStatus()
  }, [session, update])

  // Don't show banner if:
  // 1. Still loading
  // 2. No user session
  // 3. User is verified (either from session or from DB check)
  // 4. Banner has been dismissed
  if (isLoading || !session?.user || isVerified || session.user.isVerified || isDismissed) {
    return null
  }

  console.log("Rendering verification banner for unverified user")

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      console.log("Resending verification email to:", session.user.email)
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email")
      }

      toast({
        title: "Verification email sent",
        description: "Please check your inbox and click the verification link.",
      })
    } catch (error) {
      console.error("Error resending verification email:", error)
      toast({
        title: "Failed to resend verification email",
        description: "Please try again later or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Alert className="bg-blue-50 border-blue-200 mb-6">
      <div className="flex items-start justify-between w-full">
        <div className="flex">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
          <div>
            <AlertTitle className="text-blue-800 font-bold">Verify your email address</AlertTitle>
            <AlertDescription className="text-blue-700">
              Please verify your email address to access all features.
              {session.user.subscription?.plan !== "free" && " Email verification is required for paid features."}
            </AlertDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {isResending ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Email"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-blue-700 hover:bg-blue-100 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </Alert>
  )
}
