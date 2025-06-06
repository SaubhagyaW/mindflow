"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [dbVerified, setDbVerified] = useState<boolean | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // Function to check verification status from database
  const checkVerificationStatus = useCallback(async () => {
    if (!session?.user?.id || isCheckingStatus) return

    setIsCheckingStatus(true)
    try {
      console.log("EmailVerificationBanner - Checking verification status for user:", session.user.id)
      const response = await fetch("/api/user/profile", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const isVerifiedInDb = data.user?.isVerified === true

        console.log("EmailVerificationBanner - DB verification status:", {
          userId: data.user?.id,
          isVerifiedInDb,
          sessionIsVerified: session.user.isVerified
        })

        setDbVerified(isVerifiedInDb)

        // If database shows verified but session doesn't, update the session
        if (isVerifiedInDb && !session.user.isVerified) {
          console.log("EmailVerificationBanner - DB shows verified but session doesn't, updating session...")
          try {
            await update({ isVerified: true })
            console.log("EmailVerificationBanner - Session updated successfully")
          } catch (updateError) {
            console.error("EmailVerificationBanner - Error updating session:", updateError)
          }
        }
      } else {
        console.error("EmailVerificationBanner - Failed to fetch profile:", response.status)
      }
    } catch (error) {
      console.error("EmailVerificationBanner - Error checking verification status:", error)
    } finally {
      setIsCheckingStatus(false)
    }
  }, [session, update, isCheckingStatus])

  // Check verification status when component mounts and session changes
  useEffect(() => {
    if (session?.user?.id) {
      checkVerificationStatus()
    }
  }, [session?.user?.id, checkVerificationStatus])

  // Auto-check every 30 seconds if not verified
  useEffect(() => {
    if (!session?.user?.isVerified && !dbVerified && session?.user?.id) {
      const interval = setInterval(() => {
        checkVerificationStatus()
      }, 30000) // Check every 30 seconds

      return () => clearInterval(interval)
    }
  }, [session?.user?.isVerified, dbVerified, session?.user?.id, checkVerificationStatus])

  const handleResendVerification = async () => {
    if (!session?.user?.email) return

    setIsResending(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      })

      if (response.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox and click the verification link.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Failed to send verification email",
          description: data.error || "Please try again later.",
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
    } finally {
      setIsResending(false)
    }
  }

  // Don't show banner if:
  // 1. User is not authenticated
  // 2. User is verified in session
  // 3. User is verified in database
  // 4. Banner is dismissed
  if (
      !session?.user ||
      session.user.isVerified ||
      dbVerified === true ||
      isDismissed
  ) {
    return null
  }

  return (
      <Alert className="border-amber-200 bg-amber-50">
        <Mail className="h-4 w-4 text-amber-600" />
        <div className="flex-1">
          <AlertTitle className="text-amber-800">Email Verification Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            Please verify your email address to access all features. Check your inbox for a verification link.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={isResending}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
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
              className="text-amber-600 hover:bg-amber-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
  )
}
