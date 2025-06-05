"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmailVerificationBanner() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Don't show banner if user is verified or not logged in
  if (!session?.user || session.user.isVerified) {
    return null
  }

  const handleResendVerification = async () => {
    if (isResending) return // Prevent double-clicks

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
        cache: "no-store" // Ensure fresh request
      })

      console.log("Resend response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Resend failed with status:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Resend verification response:", data)

      setEmailSent(true)
      toast({
        title: "Verification email sent",
        description: "Please check your email inbox and spam folder for the verification link.",
        duration: 5000,
      })

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
