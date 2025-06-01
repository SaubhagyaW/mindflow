"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Head from "next/head"
import { VoiceConversation } from "@/components/voice-conversation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Loader2, Plus, Zap, Target, Mic, MessageSquare, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

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
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeTab, setActiveTab] = useState("new")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations()
    }
  }, [session])

  const fetchConversations = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/conversations?userId=${session.user.id}`, {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data as Conversation[])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

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

  const isAuthenticated = status === "authenticated"

  return (
    <>
      <Head>
        <title>AI Brainstorming Services | MindFlow - Voice-Powered Brainstorming AI</title>
        <meta name="description" content="Experience the most advanced brainstorming AI platform. Start voice conversations with our ChatGPT-powered assistant to transform your ideas into organized action plans. Try our AI brainstorming services now." />
        <meta name="keywords" content="brainstorming AI services, AI brainstorming platform, voice brainstorming AI, artificial intelligence brainstorming, ChatGPT brainstorming, AI ideation tool" />
        <link rel="canonical" href="https://mind-flow.ai/services" />
        <meta property="og:title" content="Professional AI Brainstorming Services | MindFlow Voice Assistant" />
        <meta property="og:description" content="Transform your creative process with MindFlow's brainstorming AI. Engage in intelligent voice conversations that automatically organize ideas into actionable insights." />
        <meta property="og:url" content="https://mind-flow.ai/services" />
      </Head>
      
      <div className="flex flex-col min-h-screen bg-white">
        <SiteHeader />

        <main className="flex-1 pt-24">
          {/* Clean Hero Section */}
          <section className="bg-gradient-to-b from-white to-blue-50 py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                AI-Powered <span className="text-blue-600">Brainstorming</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Experience the future of ideation with MindFlow's advanced <strong>brainstorming AI platform</strong>. 
                Transform voice conversations into organized ideas and actionable insights.
              </p>
              
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                      Start Free AI Brainstorming <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Main Content Area */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              {isAuthenticated ? (
                // Authenticated User Experience
                <div className="max-w-4xl mx-auto">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-center mb-8">
                      <TabsList className="bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger value="new" className="px-6 py-2">New AI Session</TabsTrigger>
                        <TabsTrigger value="history" className="px-6 py-2">Your Sessions</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="new" className="mt-0">
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Brain className="h-8 w-8 text-blue-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Start AI Brainstorming Session
                          </h2>
                          <p className="text-gray-600 max-w-2xl mx-auto">
                            Engage in natural voice conversations with our ChatGPT-powered brainstorming AI. 
                            Speak your ideas and watch them transform into organized action plans.
                          </p>
                        </div>
                        <VoiceConversation onSave={fetchConversations} />
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-0">
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <MessageSquare className="h-6 w-6 text-blue-600" />
                          <h2 className="text-2xl font-bold text-gray-900">Your AI Sessions</h2>
                        </div>

                        {conversations.length > 0 ? (
                          <div className="grid gap-4">
                            {conversations.slice(0, 6).map((conversation) => (
                              <div
                                key={conversation.id}
                                className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                                onClick={() => router.push(`/dashboard/conversations/${conversation.id}`)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-gray-900">{conversation.title}</h3>
                                  <span className="text-sm text-gray-500">
                                    {new Date(conversation.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2">
                                  {conversation.transcript.substring(0, 150)}...
                                </p>
                              </div>
                            ))}
                            {conversations.length > 6 && (
                              <div className="text-center pt-4">
                                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                                  View All Sessions
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                              <Brain className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No AI Sessions Yet
                            </h3>
                            <p className="text-gray-500 mb-6">
                              Start your first brainstorming AI conversation to see sessions here.
                            </p>
                            <Button onClick={() => setActiveTab("new")} className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="h-4 w-4 mr-2" />
                              Start First Session
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                // Non-authenticated User Experience
                <div className="max-w-6xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Features Column */}
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        Why Choose Our <span className="text-blue-600">Brainstorming AI</span>?
                      </h2>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Brain className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                              ChatGPT-Powered Intelligence
                            </h3>
                            <p className="text-gray-600">
                              Experience natural conversations with our advanced brainstorming AI that understands 
                              context and builds on your ideas intelligently.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Mic className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Voice-First Experience
                            </h3>
                            <p className="text-gray-600">
                              Speak naturally and receive intelligent responses. Our AI brainstorming platform 
                              transcribes and organizes everything automatically.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Target className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Automated Organization
                            </h3>
                            <p className="text-gray-600">
                              Transform chaotic brainstorming into structured plans. Our AI generates summaries, 
                              action items, and shareable reports instantly.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <Link href="/sign-up">
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Try Brainstorming AI Free
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Pricing Column */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        AI Brainstorming Plans
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Free Plan */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900">Free Plan</h4>
                            <span className="text-2xl font-bold text-gray-900">$0</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">Perfect for trying AI brainstorming</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span>30 minutes of AI brainstorming</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Voice conversations with AI</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Automated transcription</span>
                            </li>
                          </ul>
                        </div>

                        {/* Pro Plans */}
                        <div className="bg-white rounded-xl p-6 border-2 border-blue-600">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900">Pro Plans</h4>
                            <span className="text-2xl font-bold text-blue-600">From $11/mo</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">Unlimited AI brainstorming sessions</p>
                          <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="font-medium">2h Plan</div>
                              <div className="text-blue-600">$11/mo</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="font-medium">5h Plan</div>
                              <div className="text-blue-600">$15/mo</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="font-medium">10h Plan</div>
                              <div className="text-blue-600">$22/mo</div>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Everything in Free</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Share notes via email/WhatsApp</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Advanced conversation management</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 text-center">
                        <Link href="/pricing">
                          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                            View All Plans
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Trust Signals Section */}
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Trusted by Professionals Worldwide
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-blue-600">10K+</div>
                  <div className="text-gray-600">AI Sessions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">500K+</div>
                  <div className="text-gray-600">Ideas Generated</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">4.9/5</div>
                  <div className="text-gray-600">User Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
