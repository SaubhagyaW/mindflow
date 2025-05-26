"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {useSession} from "next-auth/react"
import Link from "next/link"
import {VoiceConversation} from "@/components/voice-conversation"
import {Button} from "@/components/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Brain, Loader2, Plus} from "lucide-react"
import {SiteHeader} from "@/components/site-header"
import {SiteFooter} from "@/components/site-footer"

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
    const {data: session, status} = useSession()
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
        <div className="flex flex-col min-h-screen bg-white">
            <SiteHeader/>

            <main className="flex-1 container mx-auto px-4 py-8 pt-24">
                <h1 className="text-3xl font-bold mb-8 mt-16 text-gray-900">AI Voice Brainstorming</h1>

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
                                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Start a Voice
                                            Conversation</h2>
                                        <p className="text-gray-600 mb-6">
                                            Have a natural voice conversation with your AI brainstorming partner to
                                            develop your ideas.
                                        </p>
                                        <VoiceConversation onSave={fetchConversations}/>
                                    </div>
                                </TabsContent>
                                <TabsContent value="history">
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Conversation
                                            History</h2>

                                        {conversations && conversations.length > 0 ? (
                                            <div className="space-y-4">
                                                {conversations.map((conversation) => (
                                                    <div key={conversation.id}
                                                         className="p-4 border border-gray-200 rounded-lg">
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
                                                <p className="text-gray-500 mb-4">You haven't started any conversations
                                                    yet.</p>
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={handleStartConversation}>
                                                    <Plus className="h-4 w-4 mr-2"/>
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
                                    <p className="text-gray-600 text-sm">25 minutes remaining</p>
                                </div>
                                <p className="text-gray-600 mb-4">Upgrade to unlock more conversation time and premium
                                    features.</p>
                                <Link href="/pricing">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Upgrade
                                        Now</Button>
                                </Link>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">Tips for Better
                                    Brainstorming</h2>
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
                            <h2 className="text-xl font-semibold mb-4 text-gray-900">Discover MindFlow AI Voice
                                Assistant</h2>
                            <p className="text-gray-600 mb-6">
                                MindFlow helps you develop ideas through natural voice conversations with an AI
                                brainstorming partner.
                                Speak naturally and get real-time voice responses.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Brain className="h-5 w-5 text-blue-600"/>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">AI-Powered Voice Brainstorming</h3>
                                        <p className="text-sm text-gray-500">
                                            Transform your ideas with MindFlow's ChatGPT-powered voice assistant. Speak
                                            naturally and receive instant AI responses that capture your best thinking.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Brain className="h-5 w-5 text-blue-600"/>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Intelligent Voice Conversations</h3>
                                        <p className="text-sm text-gray-500">
                                            Brainstorm solutions through natural audio conversations with our AI
                                            assistant. Solve problems faster without typing or manual note-taking.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Brain className="h-5 w-5 text-blue-600"/>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Automatic Transcription &
                                            Organization</h3>
                                        <p className="text-sm text-gray-500">
                                            Your voice conversations are instantly transcribed and organized into
                                            searchable summaries and actionable tasks—saving hours of manual work.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Brain className="h-5 w-5 text-blue-600"/>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Team Collaboration</h3>
                                        <p className="text-sm text-gray-500">
                                            Share generated notes and action items instantly with your team via WhatsApp
                                            or email for seamless workflow integration. </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Link href="/sign-up">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Get Started for
                                        Free</Button>
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
                                            <span className="text-gray-700">Real-time audio conversations with AI assistant</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Basic conversation transcription</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Up to 3 saved conversations</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Automated note generation</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Action item extraction</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-blue-600">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium text-gray-900">Pro Plan</h3>
                                        <span className="text-lg font-bold text-gray-900">Starting at $11/mo</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">For serious brainstormers</p>
                                    <div className="space-y-3">
                                        <div className="text-sm">
                                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-gray-700">2 hours</span>
                                                <div className="text-right">
                                                    <div className="text-gray-600">Monthly: $15</div>
                                                    <div className="text-blue-600 font-medium">Annual: $11</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-gray-700">5 hours</span>
                                                <div className="text-right">
                                                    <div className="text-gray-600">Monthly: $19</div>
                                                    <div className="text-blue-600 font-medium">Annual: $15</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-gray-700">10 hours</span>
                                                <div className="text-right">
                                                    <div className="text-gray-600">Monthly: $25</div>
                                                    <div className="text-blue-600 font-medium">Annual: $22</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="text-sm space-y-2 mt-4">
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Real-time audio conversations with AI assistant</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Basic conversation transcription</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Unlimited conversations</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Automated note generation</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Action item extraction</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Note sharing via Email</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">Manage conversations</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Link href="/pricing">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View All
                                        Plans</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <SiteFooter/>
        </div>
    )
}
