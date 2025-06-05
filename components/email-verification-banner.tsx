"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmailVerificationBanner() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)

  if (!session?.user || session.user.isVerified) {
    return null
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      console.log("Resending verification email for:", session.user?.email)

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
      console.log("Resend verification response:", data)

      if (response.ok) {
      toast({
        title: "Verification email sent",
          description: "Please check your email for the verification link.",
      })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error resending verification:", error)
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-yellow-600" />
          <span className="text-yellow-800">
              Please verify your email address to access all features.
          </span>
        </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            {isResending ? (
              <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Email"
            )}
          </Button>
      </AlertDescription>
    </Alert>
  )
}
