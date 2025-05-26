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
import { SubscriptionStatus } from "@/components/subscription-status"
import { MessageSquare, ListChecks, Loader2, Plus, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ShareNoteDialog } from "@/components/share-note-dialog"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { Input } from "@/components/ui/input"

// Define Message type
type Message = {
  role: string
  content: string
}

// Updated Conversation type with messages field instead of transcript
type Conversation = {
  id: string
  title: string
  messages: string | Message[]
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

// Simplified subscription type for basic checks
type SubscriptionData = {
  plan: string
  timeLimit: number
  usedTime: number
  remainingTime: number
  isActive: boolean
  expiresAt: string | null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("conversations")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [userSubscription, setUserSubscription] = useState<SubscriptionData | null>(null)

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  // Add state for title editing
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")

  // Check if user is on free plan or paid plan based on fetched subscription
  const isPaidUser = userSubscription && userSubscription.plan !== "free"

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  // Fetch basic subscription data for dashboard stats
  const fetchBasicSubscription = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch("/api/user/subscription", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const subscriptionData = await response.json()
        setUserSubscription(subscriptionData)
      }
    } catch (error) {
      console.error("Error fetching basic subscription data:", error)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchBasicSubscription()
    }
  }, [session])

  // Fetch conversations and notes when session is available
  useEffect(() => {
    if (session?.user?.id) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      // Fetch conversations
      const conversationsResponse = await fetch(`/api/conversations?userId=${session.user.id}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
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
        headers: {
          "Cache-Control": "no-cache",
        },
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
      setDeleteDialogOpen(false)
    }
  }

  // Handle title editing
  const startEditingTitle = (id: string, currentTitle: string) => {
    setEditingTitleId(id)
    setEditedTitle(currentTitle)
  }

  const saveEditedTitle = async (id: string) => {
    if (!editedTitle.trim()) {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/conversations/${id}/update-title`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editedTitle.trim() }),
      })

      if (response.ok) {
        // Update local state
        setConversations(conversations.map((conv) => (conv.id === id ? { ...conv, title: editedTitle.trim() } : conv)))

        // Update notes that reference this conversation
        setNotes(
          notes.map((note) => {
            if (note.conversationId === id && note.conversation) {
              return {
                ...note,
                conversation: {
                  ...note.conversation,
                  title: editedTitle.trim(),
                },
              }
            }
            return note
          }),
        )

        toast({
          title: "Success",
          description: "Conversation title updated",
        })
      } else {
        throw new Error("Failed to update title")
      }
    } catch (error) {
      console.error("Error updating title:", error)
      toast({
        title: "Error",
        description: "Failed to update the title. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEditingTitleId(null)
    }
  }

  const cancelEditingTitle = () => {
    setEditingTitleId(null)
  }

  const getConversationPreview = (conversation: Conversation): string => {
    if (typeof conversation.messages === "string") {
      return conversation.messages.substring(0, 200)
    } else if (Array.isArray(conversation.messages) && conversation.messages.length > 0) {
      // Filter out system messages
      const filteredMessages = conversation.messages.filter((message) => message.role !== "system")

      // Take first 2-3 messages for the preview
      const previewMessages = filteredMessages.slice(0, 3)

      // Format each message with proper attribution
      const formattedPreview = previewMessages
        .map((message) => {
          const speaker = message.role === "user" ? "You" : "AI"
          // Truncate individual messages if too long
          const content = message.content.length > 70 ? `${message.content.substring(0, 70)}...` : message.content

          return `${speaker}: ${content}`
        })
        .join("\n")

      // Ensure the overall preview isn't too long
      return formattedPreview.length > 200 ? `${formattedPreview.substring(0, 197)}...` : formattedPreview
    }
    return "No content available"
  }

  // Helper function to format time display (keeping minimal version for stats)
  const formatTime = (seconds: number): string => {
    if (!seconds && seconds !== 0) return "0h 0m"
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  let content

  // Show loading state while checking authentication
  if (status === "loading" || isLoading) {
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

        {/* Email verification banner */}
        {session.user && !session.user.isVerified && (
          <div className="mb-6">
            <EmailVerificationBanner />
          </div>
        )}

        {/* Use the SubscriptionStatus component */}
        <div className="mb-6">
          <SubscriptionStatus />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="new">New Conversation</TabsTrigger>
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
                    {conversations.length === 0 ? "Start your first conversation" : "Conversations saved"}
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
                  <CardTitle className="text-sm font-medium text-gray-900">Conversation Time</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {userSubscription
                      ? userSubscription.remainingTime === -1
                        ? "Unlimited"
                        : formatTime(userSubscription.remainingTime)
                      : "Loading..."}
                  </div>
                  <p className="text-xs text-gray-500">Remaining conversation time</p>
                </CardContent>
              </Card>
            </div>

            {conversations.length > 0 ? (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <Card key={conversation.id} className="bg-white hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        {editingTitleId === conversation.id ? (
                          <div className="flex items-center gap-2 w-full">
                            <Input
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              className="text-lg font-semibold"
                              placeholder="Enter conversation title"
                              autoFocus
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => saveEditedTitle(conversation.id)}
                              className="text-green-600"
                            >
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEditingTitle} className="text-gray-500">
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-gray-900">{conversation.title}</h3>
                            {isPaidUser && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-blue-600"
                                onClick={() => startEditingTitle(conversation.id, conversation.title)}
                                title="Edit Title"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}

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
                          {/* Show delete button for all users */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            onClick={() => handleDeleteClick(conversation.id)}
                            title="Delete Conversation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </p>
                      <div className="text-gray-700 space-y-1.5 whitespace-pre-line">
                        {getConversationPreview(conversation)
                          .split("\n")
                          .map((line, index) => (
                            <div
                              key={index}
                              className={`text-sm ${
                                line.startsWith("You:")
                                  ? "text-blue-600 font-medium"
                                  : line.startsWith("AI:")
                                    ? "text-purple-600 font-medium"
                                    : ""
                              }`}
                            >
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setActiveTab("new")}>
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setActiveTab("new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new">
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