"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { AudioRecorder } from "@/components/audio-recorder"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Loader2, Plus } from "lucide-react"
import Image from "next/image"; 

// Add these type definitions at the top of the file, after the imports
type Conversation = {
  id: string
  title: string
  transcript: string
  audioUrl?: string | null
  createdAt: string
  updatedAt: string
  userId: string
}

export default function ServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  // Update the useState for conversations to include the type
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeTab, setActiveTab] = useState("new")

  useEffect(() => {
    // Only show loading state briefly
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Fetch conversations when session is available
  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations()
    }
  }, [session])

  // Fix the fetchConversations function to include proper null checks
  const fetchConversations = async () => {
    if (!session?.user?.id) return

    try {
      console.log("Fetching conversations for user:", session.user.id)
      const response = await fetch(`/api/conversations?userId=${session.user.id}`, {
        cache: "no-store", // Next.js 15 explicit no caching
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched conversations:", data)
        setConversations(data as Conversation[])
      } else {
        console.error("Failed to fetch conversations:", await response.json())
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Determine if user is authenticated
  const isAuthenticated = status === "authenticated"

  const handleStartConversation = () => {
    setActiveTab("new")
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <Image src="/assets/png ai.png" alt="MindFlow Logo" width={100} height={60} className="h-16 w-auto" />
            {/* <Brain className="h-8 w-8 text-blue-600" /> */}
            {/* <span className="text-2xl font-bold text-blue-600">MindFlow</span> */}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <Link href="/services" className="text-gray-700 hover:text-blue-600 transition font-medium">
                  Services
                </Link>
                <Link href="/dashboard/settings" className="text-gray-700 hover:text-blue-600 transition">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
                  Home
                </Link>
                <Link href="/services" className="text-gray-700 hover:text-blue-600 transition font-medium">
                  Services
                </Link>
                <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition">
                  Pricing
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/api/auth/signout">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                    Sign Out
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">AI Brainstorming Services</h1>

        {isAuthenticated ? (
          // Content for authenticated users
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="new">New Conversation</TabsTrigger>
                  <TabsTrigger value="history">Conversation History</TabsTrigger>
                </TabsList>
                <TabsContent value="new" className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Start a New Conversation</h2>
                    <p className="text-gray-600 mb-6">
                      Speak with your AI brainstorming partner to capture and develop your ideas.
                    </p>
                    <AudioRecorder onSave={fetchConversations} />
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Conversation History</h2>

                    {conversations && conversations.length > 0 ? (
                      <div className="space-y-4">
                        {conversations.map((conversation) => (
                          <div key={conversation.id} className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-medium text-gray-900">{conversation.title}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(conversation.createdAt).toLocaleDateString()}
                            </p>
                            <p className="mt-2 text-gray-700 line-clamp-2">
                              {conversation.transcript.substring(0, 150)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">You haven't started any conversations yet.</p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStartConversation}>
                          <Plus className="h-4 w-4 mr-2" />
                          Start Your First Conversation
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Your MindFlow Plan</h2>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <p className="text-lg font-medium text-blue-600">Free Plan</p>
                  <p className="text-gray-600 text-sm">3 conversations remaining</p>
                </div>
                <p className="text-gray-600 mb-4">Upgrade to unlock unlimited conversations and premium features.</p>
                <Link href="/pricing">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Upgrade Now</Button>
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Tips for Better Brainstorming</h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Speak clearly and at a normal pace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Ask open-ended questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Build on ideas by saying "yes, and..."</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Don't self-edit - let ideas flow freely</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Content for non-authenticated users
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Discover MindFlow</h2>
              <p className="text-gray-600 mb-6">
                MindFlow helps you capture, organize, and share your thoughts through natural conversations with an AI
                brainstorming partner.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">AI-Powered Conversations</h3>
                    <p className="text-sm text-gray-500">
                      Have natural conversations with our AI assistant to brainstorm ideas and solve problems.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Automatic Organization</h3>
                    <p className="text-sm text-gray-500">
                      MindFlow automatically transcribes your conversations and generates summaries and action items.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Easy Sharing</h3>
                    <p className="text-sm text-gray-500">
                      Share your ideas and action items with teammates or colleagues via WhatsApp or email.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/sign-up">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Get Started for Free</Button>
                </Link>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Pricing Plans</h2>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">Free Plan</h3>
                    <span className="text-lg font-bold text-gray-900">$0</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Try MindFlow with limited features</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Up to 3 conversations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Basic conversation storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Automated note generation</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-blue-600">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">Basic Plan</h3>
                    <span className="text-lg font-bold text-gray-900">$15/mo</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">For individual brainstormers</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Unlimited conversations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Advanced conversation storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Detailed note generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">Share notes via WhatsApp or Email</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/pricing">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View All Plans</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-blue-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-100">&copy; {new Date().getFullYear()} MindFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

