"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TermsPage() {
  const { update, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const { toast } = useToast()
  const [isAccepting, setIsAccepting] = useState(false)
  const [hasAccepted, setHasAccepted] = useState(false)

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  const handleAcceptTerms = async () => {
    if (!hasAccepted) {
      toast({
        title: "Please accept the terms",
        description: "You must accept the terms to continue",
        variant: "destructive",
      })
      return
    }

    setIsAccepting(true)

    try {
      const response = await fetch("/api/user/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to accept terms")
      }

      // Update the session to reflect that terms have been accepted
      await update({ hasAcceptedTerms: true })

      toast({
        title: "Terms accepted",
        description: "Thank you for accepting our terms and conditions",
      })

      // Add a small delay to ensure the session is updated before redirecting
      setTimeout(() => {
        router.push(callbackUrl)
      }, 1000)
    } catch (error) {
      console.error("Error accepting terms:", error)
      toast({
        title: "Error",
        description: "Failed to accept terms. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render content when authenticated
  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/assets/png ai.png" alt="MindFlow Logo" width={32} height={32} className="h-16 w-auto" />
            </Link>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Terms and Policies</h1>
            <p className="text-gray-600 mt-2">
              Please review and accept our terms and policies to continue using MindFlow.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <Tabs defaultValue="terms" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="terms">Terms and Conditions</TabsTrigger>
                <TabsTrigger value="return">Return Policy</TabsTrigger>
                <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              </TabsList>

              <TabsContent value="terms" className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Terms and Conditions</h2>
                <div className="prose max-w-none text-gray-700">
                  <h3>1. Introduction</h3>
                  <p>
                    Welcome to MindFlow ("we," "our," or "us"). By accessing or using our service, you agree to be bound
                    by these Terms and Conditions.
                  </p>

                  <h3>2. Definitions</h3>
                  <p>
                    "Service" refers to the MindFlow application, website, and all content and services available
                    through them.
                  </p>
                  <p>"User" refers to any individual who accesses or uses the Service.</p>

                  <h3>3. Account Registration</h3>
                  <p>
                    To use certain features of the Service, you must register for an account. You agree to provide
                    accurate information and to keep it updated.
                  </p>

                  <h3>4. Subscription and Billing</h3>
                  <p>
                    MindFlow offers various subscription plans. By selecting a subscription plan, you agree to pay the
                    fees associated with that plan.
                  </p>

                  <h3>5. Intellectual Property</h3>
                  <p>
                    All content, features, and functionality of the Service are owned by MindFlow and are protected by
                    copyright, trademark, and other intellectual property laws.
                  </p>

                  <h3>6. User Content</h3>
                  <p>
                    You retain ownership of any content you submit to the Service. By submitting content, you grant us a
                    worldwide, non-exclusive license to use, reproduce, modify, and display that content.
                  </p>

                  <h3>7. Termination</h3>
                  <p>We may terminate or suspend your account at any time for any reason without notice.</p>

                  <h3>8. Disclaimer of Warranties</h3>
                  <p>The Service is provided "as is" without warranties of any kind.</p>

                  <h3>9. Limitation of Liability</h3>
                  <p>
                    In no event shall MindFlow be liable for any indirect, incidental, special, consequential, or
                    punitive damages.
                  </p>

                  <h3>10. Governing Law</h3>
                  <p>These Terms shall be governed by the laws of the jurisdiction in which MindFlow operates.</p>
                </div>
              </TabsContent>

              <TabsContent value="return" className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Return Policy</h2>
                <div className="prose max-w-none text-gray-700">
                  <h3>1. Subscription Cancellation</h3>
                  <p>
                    You may cancel your subscription at any time through your account settings. Cancellation will take
                    effect at the end of your current billing cycle.
                  </p>

                  <h3>2. Refunds</h3>
                  <p>
                    We offer a 14-day money-back guarantee for new subscriptions. If you are not satisfied with our
                    Service within the first 14 days of your subscription, you may request a full refund.
                  </p>

                  <h3>3. Prorated Refunds</h3>
                  <p>
                    We do not offer prorated refunds for cancellations after the 14-day period. Your subscription will
                    remain active until the end of your current billing cycle.
                  </p>

                  <h3>4. Refund Process</h3>
                  <p>
                    To request a refund, please contact our support team at support@mindflow.com. Please include your
                    account email and the reason for your refund request.
                  </p>

                  <h3>5. Refund Eligibility</h3>
                  <p>
                    Refunds are issued to the original payment method used for the purchase. Processing times may vary
                    depending on your payment provider.
                  </p>

                  <h3>6. Exceptions</h3>
                  <p>We reserve the right to deny refund requests that we determine to be abusive or fraudulent.</p>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Privacy Policy</h2>
                <div className="prose max-w-none text-gray-700">
                  <h3>1. Information We Collect</h3>
                  <p>
                    We collect information you provide directly to us, such as your name, email address, and payment
                    information. We also collect information about your use of the Service.
                  </p>

                  <h3>2. How We Use Your Information</h3>
                  <p>
                    We use your information to provide, maintain, and improve the Service, to process transactions, to
                    send you technical notices and support messages, and to respond to your comments and questions.
                  </p>

                  <h3>3. Information Sharing</h3>
                  <p>
                    We do not share your personal information with third parties except as described in this Privacy
                    Policy.
                  </p>

                  <h3>4. Data Security</h3>
                  <p>
                    We take reasonable measures to help protect your personal information from loss, theft, misuse, and
                    unauthorized access.
                  </p>

                  <h3>5. Your Choices</h3>
                  <p>
                    You can access and update certain information about your account through your account settings. You
                    can also opt out of receiving promotional emails from us by following the instructions in those
                    emails.
                  </p>

                  <h3>6. Cookies</h3>
                  <p>
                    We use cookies and similar technologies to collect information about your browsing activities and to
                    distinguish you from other users of the Service.
                  </p>

                  <h3>7. Children's Privacy</h3>
                  <p>
                    The Service is not directed to children under the age of 13, and we do not knowingly collect
                    personal information from children under 13.
                  </p>

                  <h3>8. Changes to This Policy</h3>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                    the new Privacy Policy on this page.
                  </p>

                  <h3>9. Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy, please contact us at privacy@mindflow.com.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-6">
              <Checkbox
                id="terms"
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                I have read and agree to the Terms and Conditions, Return Policy, and Privacy Policy
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAcceptTerms}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isAccepting || !hasAccepted}
              >
                {isAccepting ? "Accepting..." : "Accept and Continue"}
              </Button>

              <Link href="/api/auth/signout">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Fallback - should not reach here due to the redirect
  return null
}

