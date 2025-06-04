"use client"

import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {ArrowRight, Brain, Loader2, MessageSquare, Mic, Plus, Share2, Target, Zap} from "lucide-react";
import Head from "next/head";
import {SiteHeader} from "@/components/site-header";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {VoiceConversation} from "@/components/voice-conversation";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {SiteFooter} from "@/components/site-footer";

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

export function ServicesClient() {
    const {data: session, status} = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
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
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600"/>
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
        <>
            <Head>
                <title>AI Brainstorming Services | MindFlow - Voice-Powered Brainstorming AI</title>
                <meta name="description"
                      content="Experience the most advanced brainstorming AI platform. Start voice conversations with our ChatGPT-powered assistant to transform your ideas into organized action plans. Try our AI brainstorming services now."/>
                <meta name="keywords"
                      content="brainstorming AI services, AI brainstorming platform, voice brainstorming AI, artificial intelligence brainstorming, ChatGPT brainstorming, AI ideation tool"/>
                <link rel="canonical" href="https://mind-flow.ai/services"/>
                <meta property="og:title" content="Professional AI Brainstorming Services | MindFlow Voice Assistant"/>
                <meta property="og:description"
                      content="Transform your creative process with MindFlow's brainstorming AI. Engage in intelligent voice conversations that automatically organize ideas into actionable insights."/>
                <meta property="og:url" content="https://mind-flow.ai/services"/>
            </Head>

            <div className="flex flex-col min-h-screen bg-white">
                <SiteHeader/>

                <main className="flex-1 container mx-auto px-4 py-12 pt-32">
                    {/* Hero Section for AI Brainstorming Services */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            Professional <span className="text-blue-600">AI Brainstorming Services</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                            Experience the future of ideation with MindFlow's advanced <strong>brainstorming AI
                            platform</strong>.
                            Our ChatGPT-powered voice assistant transforms natural conversations into organized ideas,
                            structured notes, and actionable insights—revolutionizing how professionals approach
                            creative problem-solving.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <Brain className="h-8 w-8 text-blue-600 mx-auto mb-3"/>
                                <h3 className="font-semibold text-gray-900 mb-2">Intelligent AI Conversations</h3>
                                <p className="text-gray-600 text-sm">Engage with our brainstorming AI for natural,
                                    productive ideation sessions</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                <Zap className="h-8 w-8 text-green-600 mx-auto mb-3"/>
                                <h3 className="font-semibold text-gray-900 mb-2">Real-Time Organization</h3>
                                <p className="text-gray-600 text-sm">Watch ideas transform into structured plans
                                    automatically</p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <Target className="h-8 w-8 text-purple-600 mx-auto mb-3"/>
                                <h3 className="font-semibold text-gray-900 mb-2">Actionable Results</h3>
                                <p className="text-gray-600 text-sm">Generate concrete next steps from every
                                    brainstorming AI session</p>
                            </div>
                        </div>
                    </div>

                    {isAuthenticated ? (
                        // Content for authenticated users - App Interface
                        <div className="max-w-6xl mx-auto">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
                                    <TabsTrigger value="new">New Session</TabsTrigger>
                                    <TabsTrigger value="history">History</TabsTrigger>
                                </TabsList>

                                <TabsContent value="new" className="space-y-8">
                                    <div
                                        className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
                                        <div className="text-center mb-6">
                                            <Mic className="h-12 w-12 text-blue-600 mx-auto mb-4"/>
                                            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                                                Start Your AI Brainstorming Session
                                            </h2>
                                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                                Begin a natural voice conversation with our brainstorming AI. Speak your
                                                ideas
                                                and watch as our assistant helps develop and organize your thoughts.
                                            </p>
                                        </div>
                                        <VoiceConversation onSave={fetchConversations}/>
                                    </div>
                                </TabsContent>

                                <TabsContent value="history">
                                    <div
                                        className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
                                        <div className="flex items-center gap-3 mb-6">
                                            <MessageSquare className="h-8 w-8 text-blue-600"/>
                                            <h2 className="text-2xl font-semibold text-gray-900">Your Brainstorming
                                                Sessions</h2>
                                        </div>

                                        {conversations && conversations.length > 0 ? (
                                            <div className="space-y-4">
                                                {conversations.map((conversation) => (
                                                    <div
                                                        key={conversation.id}
                                                        className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                                                        onClick={() => router.push(`/dashboard/conversations/${conversation.id}`)}
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h3 className="font-semibold text-gray-900 text-lg">{conversation.title}</h3>
                                                            <span className="text-sm text-gray-500">
                                {new Date(conversation.createdAt).toLocaleDateString()}
                              </span>
                                                        </div>
                                                        <p className="text-gray-700 line-clamp-3 mb-3">
                                                            {conversation.transcript.substring(0, 200)}...
                                                        </p>
                                                        <div className="flex items-center gap-2 text-blue-600">
                                                            <Brain className="h-4 w-4"/>
                                                            <span className="text-sm font-medium">AI Session</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Brain className="h-16 w-16 text-gray-300 mx-auto mb-6"/>
                                                <h3 className="text-xl font-medium text-gray-900 mb-3">
                                                    No Sessions Yet
                                                </h3>
                                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                                    Start your first brainstorming conversation to see sessions appear
                                                    here.
                                                </p>
                                                <Button
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={handleStartConversation}
                                                >
                                                    <Plus className="h-4 w-4 mr-2"/>
                                                    Start Now
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        // Content for non-authenticated users - Educational & Value-focused
                        <div className="space-y-16">
                            {/* How It Works Section */}
                            <section className="max-w-6xl mx-auto">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                                        How Our <span className="text-blue-600">Brainstorming AI</span> Works
                                    </h2>
                                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                        Experience a revolutionary approach to ideation with our step-by-step AI-powered
                                        process
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-4 gap-8">
                                    <div className="text-center">
                                        <div
                                            className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Speak Naturally</h3>
                                        <p className="text-gray-600 text-sm">
                                            Start a voice conversation with our AI. No scripts needed—just talk about
                                            your ideas, challenges, or goals.
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div
                                            className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-3">AI Engages</h3>
                                        <p className="text-gray-600 text-sm">
                                            Our brainstorming AI asks insightful questions, builds on your ideas, and
                                            provides creative suggestions in real-time.
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div
                                            className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Auto-Organize</h3>
                                        <p className="text-gray-600 text-sm">
                                            Watch as the AI automatically transcribes, categorizes, and structures your
                                            conversation into clear insights.
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div
                                            className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Take Action</h3>
                                        <p className="text-gray-600 text-sm">
                                            Receive formatted summaries, action plans, and shareable notes that turn
                                            ideas into executable strategies.
                                        </p>
                                    </div>
                                </div>
                            </section>


                            {/* Benefits Section */}
                            <section className="max-w-6xl mx-auto">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                                        Why Choose AI-Powered <span className="text-blue-600">Brainstorming</span>?
                                    </h2>
                                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                        Discover the competitive advantages of integrating artificial intelligence into
                                        your creative process
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 mb-12">
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                                                <Brain className="h-6 w-6 text-blue-600"/>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Unlimited Creative
                                                    Energy</h3>
                                                <p className="text-gray-600 text-sm">
                                                    Never hit creative blocks again. Our AI provides fresh perspectives
                                                    and infinite idea generation capabilities, available 24/7.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                                                <Zap className="h-6 w-6 text-green-600"/>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">10x Faster
                                                    Ideation</h3>
                                                <p className="text-gray-600 text-sm">
                                                    Accelerate your creative process with instant AI responses and
                                                    automatic organization that saves hours of manual work.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
                                                <Target className="h-6 w-6 text-purple-600"/>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Zero Ideas Lost</h3>
                                                <p className="text-gray-600 text-sm">
                                                    Perfect transcription and intelligent categorization ensure every
                                                    brilliant thought is captured and easily retrievable.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-orange-100 p-3 rounded-full flex-shrink-0">
                                                <MessageSquare className="h-6 w-6 text-orange-600"/>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Natural Conversation
                                                    Flow</h3>
                                                <p className="text-gray-600 text-sm">
                                                    Voice-first interface feels like talking to a creative partner, not
                                                    operating software. Think out loud naturally.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-teal-100 p-3 rounded-full flex-shrink-0">
                                                <Mic className="h-6 w-6 text-teal-600"/>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Hands-Free
                                                    Creativity</h3>
                                                <p className="text-gray-600 text-sm">
                                                    Brainstorm while walking, driving, or anywhere. No keyboards, no
                                                    screens—just pure creative conversation.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="bg-pink-100 p-3 rounded-full flex-shrink-0">
                                                <Share2 className="h-6 w-6 text-pink-600"/>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Instant Team
                                                    Sharing</h3>
                                                <p className="text-gray-600 text-sm">
                                                    Share AI-generated summaries and action plans with your team via
                                                    email or WhatsApp in one click.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Trust Signals Section */}
                            <section className="py-16 bg-white">
                                <div className="max-w-6xl mx-auto text-center">
                                    <h3 className="text-2xl font-semibold mb-8 text-gray-900">
                                        Trusted by Professionals Worldwide
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">10K+</div>
                                            <div className="text-gray-600">AI Sessions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">500K+</div>
                                            <div className="text-gray-600">Ideas Generated</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-600">4.9/5</div>
                                            <div className="text-gray-600">User Rating</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-600">99.9%</div>
                                            <div className="text-gray-600">Uptime</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* CTA Section */}
                            <section
                                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 -mx-4 rounded-xl">
                                <div className="max-w-4xl mx-auto px-4 text-center">
                                    <h2 className="text-3xl font-bold mb-6">
                                        Ready to Transform Your Brainstorming Process?
                                    </h2>
                                    <p className="text-xl mb-8 opacity-90">
                                        Join thousands of innovators who are already using AI to accelerate their
                                        creative workflows
                                    </p>
                                    <div className="flex justify-center">
                                        <Link href="/sign-up">
                                            <Button size="lg"
                                                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                                                Start Free Trial <ArrowRight className="ml-2 h-5 w-5"/>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </main>

                <SiteFooter/>
            </div>
        </>
    )
}