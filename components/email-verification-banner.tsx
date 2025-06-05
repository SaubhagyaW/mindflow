"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertCircle, Loader2, CheckCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmailVerificationBanner() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // Check actual verification status on component mount
  useEffect(() => {
    if (session?.user?.email) {
      checkVerificationStatus()
    }
  }, [session?.user?.email])

  const checkVerificationStatus = async () => {
    if (!session?.user?.email) return

    setIsCheckingStatus(true)
    try {
      console.log("Checking actual verification status for:", session.user.email)

      const response = await fetch("/api/user/verification-status", {
        method: "GET",
        cache: "no-store"
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Verification status response:", data)

        if (data.isVerified && !session.user.isVerified) {
          console.log("User is verified in DB but not in session - updating session")
          await update({ isVerified: true })

          toast({
            title: "Email verified",
            description: "Your email has been verified successfully!",
          })
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  // Don't show banner if user is verified
  if (!session?.user || session.user.isVerified) {
    return null
  }

  const handleResendVerification = async () => {
    if (isResending) return

    setIsResending(true)
    setEmailSent(false)

    try {
      console.log("Attempting to resend verification email for:", session.user?.email)

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
        cache: "no-store"
      })

      const data = await response.json()
      console.log("Resend verification response:", data)

      if (response.ok) {
        if (data.isVerified && data.shouldUpdateSession) {
          // User is already verified, update session
          console.log("User already verified, updating session...")
          await update({ isVerified: true })

          toast({
            title: "Email already verified",
            description: "Your email was already verified. Welcome!",
          })
        } else {
          // Email sent successfully
          setEmailSent(true)
          toast({
            title: "Verification email sent",
            description: "Please check your email inbox and spam folder for the verification link.",
            duration: 5000,
          })
        }
      } else {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

    } catch (error) {
      console.error("Error resending verification email:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      toast({
        title: "Failed to send email",
        description: `Error: ${errorMessage}. Please try again or contact support.`,
        variant: "destructive",
        duration: 7000,
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 flex-1">
            <Mail className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-800">
            {emailSent
                ? "Verification email sent! Please check your inbox and spam folder."
                : "Please verify your email address to access all features."
            }
          </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {emailSent && (
                <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <Button
                variant="outline"
                size="sm"
                onClick={checkVerificationStatus}
                disabled={isCheckingStatus}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 mr-2"
                title="Check if email is already verified"
            >
              {isCheckingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                  <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResending}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 whitespace-nowrap"
            >
              {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
              ) : emailSent ? (
                  "Send Again"
              ) : (
                  "Resend Email"
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
  )
}
