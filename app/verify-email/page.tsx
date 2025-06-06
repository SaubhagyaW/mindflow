"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { update } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Verification token is missing")
      return
    }

    const verifyEmail = async () => {
      try {
        console.log("Verifying email with token:", token)
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        console.log("Verification response:", data)

        if (response.ok) {
          setStatus("success")
          setMessage(data.message || "Your email has been verified successfully!")

          // Update the session to reflect the verified status
          console.log("Updating session with verified status")
          await update({ isVerified: true })

          // Force a session refresh by making a request to the session endpoint
          await fetch("/api/auth/session", {
            method: "GET",
            cache: "no-store",
          })

          // Show success toast
          toast({
            title: "Email verified",
            description: "Your email has been successfully verified.",
          })

          // Automatically redirect to dashboard after 3 seconds
          setTimeout(() => {
            // Force a hard navigation to ensure the session is refreshed
            window.location.href = "/dashboard"
          }, 3000)
        } else {
          console.error("Verification failed:", data.error)
          setStatus("error")
          setMessage(data.error || "Failed to verify your email")

          // Check if the user is already verified
          try {
            const profileResponse = await fetch("/api/user/profile", {
              cache: "no-store",
            })

            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              if (profileData.user && profileData.user.hasAcceptedTerms) {
                setStatus("success")
                setMessage("Your email is already verified!")
                await update({ isVerified: true })

                // Force session refresh
                await fetch("/api/auth/session", {
                  method: "GET",
                  cache: "no-store",
                })

                // Automatically redirect to dashboard after 3 seconds
                setTimeout(() => {
                  window.location.href = "/dashboard"
                }, 3000)
              }
            }
          } catch (profileError) {
            console.error("Error checking profile:", profileError)
          }
        }
      } catch (error) {
        console.error("Error during verification:", error)
        setStatus("error")
        setMessage("An error occurred during verification")
      }
    }

    verifyEmail()
  }, [token, update, toast])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="flex justify-center items-center gap-2">
          <Image src="/assets/png ai.png" alt="MindFlow Logo" width={40} height={40} className="h-16 w-auto" />
        </Link>

        <div className="mt-10 bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
              <p className="text-gray-500 mt-2">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Email Verified!</h2>
              <p className="text-gray-500 mt-2">{message}</p>
              <p className="text-gray-500 mt-2">Redirecting to dashboard in a few seconds...</p>
              <div className="mt-6">
                <Link href="/dashboard">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // Force hard navigation to ensure session refresh
                      window.location.href = "/dashboard"
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-12 w-12 text-red-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
              <p className="text-gray-500 mt-2">{message}</p>
              <div className="mt-6 space-y-4">
                <Link href="/dashboard">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    onClick={() => {
                      // Force hard navigation to ensure session refresh
                      window.location.href = "/dashboard"
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
