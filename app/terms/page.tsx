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
import ReactMarkdown from "react-markdown"

// Custom styles for markdown content
const markdownStyles = {
  heading: "font-bold text-gray-900 mt-6 mb-3",
  h1: "text-2xl",
  h2: "text-xl",
  h3: "text-lg",
  h4: "text-base",
  paragraph: "mb-4 text-gray-700 leading-relaxed",
  list: "list-disc ml-6 mb-4 text-gray-700",
  listItem: "mb-1",
  link: "text-blue-600 hover:underline",
}

export default function TermsPage() {
    const { update, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
    const { toast } = useToast()
    const [isAccepting, setIsAccepting] = useState(false)
    const [hasAccepted, setHasAccepted] = useState(false)
  const [termsContent, setTermsContent] = useState("")
  const [privacyContent, setPrivacyContent] = useState("")
  const [returnContent, setReturnContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)

    // Redirect to sign-in if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/sign-in")
        }
    }, [status, router])

  // Load markdown content
  useEffect(() => {
    const loadMarkdownContent = async () => {
      try {
        setIsLoading(true)

        // Fetch all markdown files in parallel
        const [termsResponse, privacyResponse, returnResponse] = await Promise.all([
          fetch('/assets/legal_contracts/terms.md'),
          fetch('/assets/legal_contracts/privacy.md'),
          fetch('/assets/legal_contracts/return.md')
        ])

        if (!termsResponse.ok || !privacyResponse.ok || !returnResponse.ok) {
          throw new Error("Failed to load one or more policy files")
        }

        const terms = await termsResponse.text()
        const privacy = await privacyResponse.text()
        const returnPolicy = await returnResponse.text()

        setTermsContent(terms)
        setPrivacyContent(privacy)
        setReturnContent(returnPolicy)
      } catch (error) {
        console.error("Error loading markdown files:", error)
        toast({
          title: "Error",
          description: "Failed to load policy documents. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      loadMarkdownContent()
    }
  }, [status, toast])

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

  // Custom components for ReactMarkdown
  const MarkdownComponents = {
    h1: ({ node, ...props }) => <h1 className={`${markdownStyles.heading} ${markdownStyles.h1}`} {...props} />,
    h2: ({ node, ...props }) => <h2 className={`${markdownStyles.heading} ${markdownStyles.h2}`} {...props} />,
    h3: ({ node, ...props }) => <h3 className={`${markdownStyles.heading} ${markdownStyles.h3}`} {...props} />,
    h4: ({ node, ...props }) => <h4 className={`${markdownStyles.heading} ${markdownStyles.h4}`} {...props} />,
    p: ({ node, ...props }) => <p className={markdownStyles.paragraph} {...props} />,
    ul: ({ node, ...props }) => <ul className={markdownStyles.list} {...props} />,
    ol: ({ node, ...props }) => <ol className={`${markdownStyles.list} list-decimal`} {...props} />,
    li: ({ node, ...props }) => <li className={markdownStyles.listItem} {...props} />,
    a: ({ node, ...props }) => <a className={markdownStyles.link} {...props} target="_blank" rel="noopener noreferrer" />,
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

              {isLoading ? (
                <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">Loading policy documents...</p>
                </div>
              ) : (
                <>
                            <TabsContent value="terms" className="p-6">
                                <div className="prose max-w-none text-gray-700">
                      <ReactMarkdown components={MarkdownComponents}>{termsContent}</ReactMarkdown>
                                </div>
                            </TabsContent>

                            <TabsContent value="return" className="p-6">
                                <div className="prose max-w-none text-gray-700">
                      <ReactMarkdown components={MarkdownComponents}>{returnContent}</ReactMarkdown>
                                </div>
                            </TabsContent>

                            <TabsContent value="privacy" className="p-6">
                                <div className="prose max-w-none text-gray-700">
                      <ReactMarkdown components={MarkdownComponents}>{privacyContent}</ReactMarkdown>
                                </div>
                            </TabsContent>
                </>
              )}
                        </Tabs>
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                        <div className="flex items-center space-x-2 mb-6">
                            <Checkbox
                                id="terms"
                                checked={hasAccepted}
                                onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
                disabled={isLoading}
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
                disabled={isAccepting || !hasAccepted || isLoading}
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
