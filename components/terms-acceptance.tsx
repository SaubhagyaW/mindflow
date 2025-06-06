"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TermsAcceptanceProps {
  termsContent: string
  privacyContent: string
  returnPolicyContent: string
}

export function TermsAcceptance({ termsContent, privacyContent, returnPolicyContent }: TermsAcceptanceProps) {
  const router = useRouter()
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("terms")
  const [isAccepted, setIsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("TermsAcceptance component mounted, checking session...")
    if (session) {
      console.log("User session data:", session)
    }
  }, [session])

  // Handle terms acceptance
  const handleAcceptTerms = async () => {
    console.log("handleAcceptTerms triggered")
    if (!isAccepted) {
      console.warn("User attempted to submit without checking acceptance box")
      toast({
        title: "Please confirm",
        description: "You must check the box to confirm you've read and agree to our terms.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)
    console.log("Submitting acceptance to /api/user/accept-terms")

    try {
      const response = await fetch("/api/user/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseData = await response.json()
      console.log("Received response from /api/user/accept-terms:", responseData)

      if (!response.ok) {
        console.error("API responded with an error:", responseData.error)
        throw new Error(responseData.error || "Failed to accept terms")
      }

      // Update the session immediately
      console.log("Terms accepted successfully, updating session...")
      await update({
        hasAcceptedTerms: true,
        isVerified: true // Also mark as verified since terms acceptance implies verification
      })

      // Force a session refresh
      await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      })

      toast({
        title: "Terms accepted",
        description: "Thank you for accepting our terms. Redirecting to dashboard...",
      })

      console.log("Session updated, redirecting to dashboard...")

      // Use multiple redirect strategies to ensure it works
      setTimeout(() => {
        // First try Next.js router
        router.push("/dashboard")

        // Fallback to hard navigation after a short delay
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      }, 1500)

    } catch (error: any) {
      console.error("Error accepting terms:", error)
      setError(error.message || "There was a problem accepting the terms. Please try again.")
      toast({
        title: "Error",
        description: error.message || "There was a problem accepting the terms. Please try again.",
        variant: "destructive",
      })
    } finally {
      console.log("Finished terms acceptance process, setting submitting to false")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to MindFlow</h1>
          <p className="mt-2 text-gray-600">Before you continue, please review and accept our legal agreements.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          console.log("Tab changed to:", value)
          setActiveTab(value)
        }} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="return">Return Policy</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="terms" className="mt-0">
              <div className="bg-gray-50 rounded-md p-4 h-[400px] overflow-y-auto prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: termsContent }} />
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <div className="bg-gray-50 rounded-md p-4 h-[400px] overflow-y-auto prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: privacyContent }} />
              </div>
            </TabsContent>

            <TabsContent value="return" className="mt-0">
              <div className="bg-gray-50 rounded-md p-4 h-[400px] overflow-y-auto prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: returnPolicyContent }} />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {error && (
          <div className="px-6 py-3 bg-red-50 text-red-700 border-t border-red-200">
            <p>{error}</p>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start space-x-2 mb-6">
            <Checkbox
              id="terms"
              checked={isAccepted}
              onCheckedChange={(checked) => {
                console.log("Checkbox toggled:", checked)
                setIsAccepted(checked as boolean)
              }}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 leading-tight">
              I have read and agree to the Terms of Service, Privacy Policy, and Return Policy
            </label>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => {
              console.log("User clicked cancel. Redirecting to home.")
              router.push("/")
            }} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAcceptTerms} disabled={isSubmitting || !isAccepted}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Accept and Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
