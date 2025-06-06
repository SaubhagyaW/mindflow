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
  use