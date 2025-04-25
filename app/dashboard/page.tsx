"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoiceConversation } from "@/components/voice-conversation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { MessageSquare, ListChecks, Share2, Loader2, Plus, Trash2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ShareNoteDialog } from "@/components/share-note-dialog"
import { EmailVerificationBanner } from "@/components/email-verification-banner"

// Define Message type
type Message = {
  role: string;
  content: string;
}

// Updated Conversation type with messages field instead of transcript
type Conversation = {
  id: string
  title: string
  messages: string | Message[] // Can be either string or array of Message objects
  audioUrl?: string | null
  createdAt: string
  updatedAt: string
  userId: string
}

type Note = {
  id: string
  content: string
  actionItems?: string | null
  isShared: boolean
  createdAt: string
  updatedAt: string
  userId: string
  conversationId: string
  conversation?: {
    title: string
  }
}

type Subscription = {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("conversations")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true)

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  
  // Check if user is on free plan or paid plan based on fetched subscription
  const isPaidUser = session?.user && session.user.subscription && session.user.subscription.plan !== "free"
  // Check if free user has reached conversation limit
  const hasReachedLimit = !isPaidUser && conversations.length >= 3

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  // Fetch user subscription data separately
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user?.id) return;

      setIsSubscriptionLoading(true);
      try {
        const response = await fetch(`/api/user/subscription?userId=${session.user.id}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const subscriptionData = await response.json();
          console.log("Fetched subscription:", subscriptionData);
          setUserSubscription(subscriptionData);
        } else {
          console.error("Failed to fetch subscription:", await response.json());
          // Set default to free plan if fetch fails
          setUserSubscription({ plan: "free", status: "active" });
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        // Set default to free plan if fetch errors
        setUserSubscription({ plan: "free", status: "active" });
      } finally {
        setIsSubscriptionLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchSubscription();
    }
  }, [session]);

  // Fetch conversations and notes when session is available
  useEffect(() => {
    if (session?.user?.id) {
      fetchData()
    }
  }, [session])

  // Automatically switch to conversations tab if free user tries to create more than 3 conversations
  useEffect(() => {
    if (hasReachedLimit && activeTab === "new") {
      setActiveTab("conversations")
      toast({
        title: "Conversation limit reached",
        description: "Free plan supports up to 3 conversations. Please upgrade for unlimited conversations.",
        variant: "destructive",
      })
    }
  }, [hasReachedLimit, activeTab, toast])

  // Log session data to debug verification status
  useEffect(() => {
    if (session?.user) {
      console.log("Session user data:", {
        id: session.user.id,
        email: session.user.email,
        isVerified: session.user.isVerified,
      })
    }
  }, [session])

  // Fix the fetchData function to include proper null checks
  const fetchData = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      // Fetch conversations
      const conversationsResponse = await fetch(`/api/conversations?userId=${session.user.id}`, {
        cache: "no-store",
      })

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json()
        console.log("Fetched conversations:", conversationsData)
        setConversations(conversationsData as Conversation[])
      } else {
        console.error("Failed to fetch conversations:", await conversationsResponse.json())
      }

      // Fetch notes
      const notesResponse = await fetch(`/api/notes?userId=${session.user.id}`, {
        cache: "no-store",
      })

      if (notesResponse.ok) {
        const notesData = await notesResponse.json()
        console.log("Fetched notes:", notesData)
        setNotes(notesData as Note[])
      } else {
        console.error("Failed to fetch notes:", await notesResponse.json())
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Updated to open the confirmation dialog instead of using browser confirm
  const handleDeleteClick = (id: string) => {
    setConversationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return

    try {
      const response = await fetch(`/api/conversations/${conversationToDelete}`, {
        method: "DELETE",
        cache: "no-store",
      })

      if (response.ok) {
        // Update the local state to remove the deleted conversation
        setConversations(conversations.filter((conv) => conv.id !== conversationToDelete))

        // Also remove any notes associated with this conversation
        setNotes(notes.filter((note) => note.conversationId !== conversationToDelete))

        // Show success message with toast
        toast({
          title: "Conversation deleted",
          description: "The conversation has been successfully removed.",
        })
      } else {
        throw new Error("Failed to delete conversation")
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConversationToDelete(null)
    }
  }

  const getConversationPreview = (conversation: Conversation): string => {
    if (typeof conversation.messages === 'string') {
      return conversation.messages.substring(0, 200);
    } else if (Array.isArray(conversation.messages) && conversation.messages.length > 0) {
      // Filter out system messages
      const filteredMessages = conversation.messages.filter(
        (message) => message.role !== 'system'
      );
  
      // Take first 2-3 messages for the preview
      const previewMessages = filteredMessages.slice(0, 3);
      
      // Format each message with proper attribution
      const formattedPreview = previewMessages.map(message => {
        const speaker = message.role === 'user' ? 'You' : 'AI';
        // Truncate individual messages if too long
        const content = message.content.length > 70 
          ? `${message.content.substring(0, 70)}...` 
          : message.content;
          
        return `${speaker}: ${content}`;
      }).join('\n');
      
      // Ensure the overall preview isn't too long
      return formattedPreview.length > 200 
        ? `${formattedPreview.substring(0, 197)}...` 
        : formattedPreview;
    }
    return "No content available";
  }
  

  let content

  // Show loading state while checking authentication or loading subscription
  if (status === "loading" || isLoading || isSubscriptionLoading) {
    content = (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  } else if (status === "authenticated") {
    content = (
      <DashboardShell>
        <DashboardHeader heading="Dashboard" text="Manage your conversations and generated notes." />

        {/* Make the verification banner more prominent */}
        {session.user && !session.user.isVerified && (
          <div className="mb-6">
            <EmailVerificationBanner />
          </div>
        )}

        {/* Show upgrade banner for free users */}
        {!isPaidUser && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Free Plan</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>You're currently on the free plan which supports up to 3 conversations. 
                     {hasReachedLimit ? " You've reached your limit." : ` You have ${3 - conversations.length} remaining.`}</p>
                </div>
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    className="text-blue-700 bg-white border-blue-300 hover:bg-blue-50"
                    onClick={() => router.push("/pricing")}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="new" disabled={hasReachedLimit}>New Conversation</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Total Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{conversations.length}</div>
                  <p className="text-xs text-gray-500">
                    {conversations.length === 0 ? "Start your first conversation" : `Conversations saved ${!isPaidUser ? `(${conversations.length}/3)` : ""}`}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Generated Notes</CardTitle>
                  <ListChecks className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{notes.length}</div>
                  <p className="text-xs text-gray-500">
                    {notes.length === 0 ? "Notes are generated from conversations" : "Notes generated"}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">Shared Notes</CardTitle>
                  <Share2 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{notes.filter((note) => note.isShared).length}</div>
                  <p className="text-xs text-gray-500">
                    {notes.filter((note) => note.isShared).length === 0
                      ? "No notes shared yet"
                      : "Notes shared with others"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {conversations.length > 0 ? (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <Card key={conversation.id} className="bg-white hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{conversation.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-blue-600"
                            onClick={() => router.push(`/dashboard/conversations/${conversation.id}`)}
                            title="View Conversation"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {/* Only show delete button for paid users */}
                          {isPaidUser && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteClick(conversation.id)}
                              title="Delete Conversation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </p>
                      <div className="text-gray-700 space-y-1.5 whitespace-pre-line">
                        {getConversationPreview(conversation).split('\n').map((line, index) => (
                          <div key={index} className={`text-sm ${
                            line.startsWith('You:') ? 'text-blue-600 font-medium' : 
                            line.startsWith('AI:') ? 'text-purple-600 font-medium' : ''
                          }`}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-500 mb-6">Start a new conversation to see it here.</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => setActiveTab("new")}
                  disabled={hasReachedLimit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className="bg-white hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {note.conversation?.title || "Untitled Note"}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-blue-600"
                          onClick={() => router.push(`/dashboard/conversations/${note.conversationId}`)}
                        >
                          <ListChecks className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{new Date(note.createdAt).toLocaleDateString()}</p>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Summary of Main Ideas:</h4>
                          <div className="bg-blue-50 p-4 rounded-md text-gray-700">
                            <p className="line-clamp-3">{note.content}</p>
                          </div>
                        </div>

                        {note.actionItems && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Action Items:</h4>
                            <div className="bg-green-50 p-4 rounded-md text-gray-700">
                              <p className="line-clamp-3">{note.actionItems}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {session?.user?.id && note.id && (
                        <div className="mt-4 flex justify-end">
                          <ShareNoteDialog
                            noteId={note.id}
                            noteTitle={note.conversation?.title || "Untitled Note"}
                            onShareSuccess={fetchData}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                <ListChecks className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                <p className="text-gray-500 mb-6">Notes are automatically generated from your conversations.</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => setActiveTab("new")}
                  disabled={hasReachedLimit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new">
            {hasReachedLimit ? (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Conversation Limit Reached</CardTitle>
                  <CardDescription className="text-gray-500">
                    Free plan supports up to 3 conversations. Upgrade to premium for unlimited conversations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upgrade to Premium</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      As a premium user, you'll enjoy unlimited conversations, the ability to delete conversations, 
                      and other exclusive features.
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white" 
                      onClick={() => router.push("/pricing")}
                    >
                      View Pricing Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Start a Voice Conversation</CardTitle>
                  <CardDescription className="text-gray-500">
                    Have a natural voice conversation with your AI brainstorming partner to develop your ideas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VoiceConversation onSave={fetchData} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConversation}
          title="Delete Conversation"
          description="Are you sure you want to delete this conversation? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </DashboardShell>
    )
  } else {
    content = null
  }

  return <>{content}</>
}