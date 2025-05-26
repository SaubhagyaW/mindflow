"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Loader2, ArrowLeft, Trash2, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShareNoteDialog } from "@/components/share-note-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import React from "react" // Import React for use() function

// Define Message type
type Message = {
  role: string
  content: string
}

type Conversation = {
  id: string
  title: string
  messages: string | Message[] // Replace transcript with messages
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
  plan: string
  status: string
}

type PageParams = {
  id: string
}

export default function ConversationDetailPage({ params }: { params: PageParams }) {
  // Properly use React.use() to unwrap the params
  const unwrappedParams = React.use(params as any) as PageParams
  const conversationId = unwrappedParams.id

  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [note, setNote] = useState<Note[]>([])
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Add state for title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")

  // Check if user is on paid plan
  const isPaidUser = userSubscription && userSubscription.plan !== "free"

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  // Fetch user subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user?.id) return

      setIsSubscriptionLoading(true)
      try {
        const response = await fetch(`/api/user/subscription?userId=${session.user.id}`, {
          cache: "no-store",
        })

        if (response.ok) {
          const subscriptionData = await response.json()
          console.log("Fetched subscription:", subscriptionData)
          setUserSubscription(subscriptionData)
        } else {
          console.error("Failed to fetch subscription:", await response.json())
          setUserSubscription({ plan: "free", status: "active" })
        }
      } catch (error) {
        console.error("Error fetching subscription:", error)
        setUserSubscription({ plan: "free", status: "active" })
      } finally {
        setIsSubscriptionLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchSubscription()
    }
  }, [session])

  // Fetch conversation and note data
  useEffect(() => {
    if (status === "authenticated" && conversationId) {
      fetchData()
    }
  }, [status, conversationId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch conversation
      const conversationResponse = await fetch(`/api/conversations/${conversationId}`, {
        cache: "no-store",
      })

      if (conversationResponse.ok) {
        const conversationData = await conversationResponse.json()
        setConversation(conversationData)
        setEditedTitle(conversationData.title) // Initialize edited title
      } else {
        // Handle error without trying to parse JSON
        console.error("Failed to fetch conversation:", conversationResponse.status, conversationResponse.statusText)
      }

      // Fetch note
      const noteResponse = await fetch(`/api/notes?userId=${session?.user?.id || ""}`, {
        cache: "no-store",
      })

      if (noteResponse.ok) {
        const noteData = await noteResponse.json()
        console.log("Fetched notes:", noteData)
        setNote(noteData)
      } else {
        // Handle error without trying to parse JSON
        console.error("Failed to fetch note:", noteResponse.status, noteResponse.statusText)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
        cache: "no-store",
      })

      if (response.ok) {
        toast({
          title: "Conversation deleted",
          description: "The conversation has been successfully removed.",
        })
        router.push("/dashboard")
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
      setDeleteDialogOpen(false)
    }
  }

  // Handle title editing
  const startEditingTitle = () => {
    if (!isPaidUser) {
      toast({
        title: "Premium Feature",
        description: "Title editing is available for premium users only.",
        variant: "destructive",
      })
      return
    }

    setIsEditingTitle(true)
    setEditedTitle(conversation?.title || "")
  }

  const saveEditedTitle = async () => {
    if (!editedTitle.trim()) {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}/update-title`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editedTitle.trim() }),
      })

      if (response.ok) {
        // Update local state
        if (conversation) {
          setConversation({
            ...conversation,
            title: editedTitle.trim(),
          })
        }

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
      setIsEditingTitle(false)
    }
  }

  const cancelEditingTitle = () => {
    setIsEditingTitle(false)
    setEditedTitle(conversation?.title || "")
  }

  // Function to render messages based on format
  const renderMessages = () => {
    if (!conversation) return null

    // If messages is a string, display it directly (for backward compatibility)
    if (typeof conversation.messages === "string") {
      return <div className="whitespace-pre-wrap">{conversation.messages}</div>
    }

    // If messages is an array, format each message based on role
    if (Array.isArray(conversation.messages)) {
      return (
        <div className="space-y-4">
          {conversation.messages
            .filter((message) => message.role !== "system")
            .map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role !== "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/ai-avatar.png" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user" ? "bg-blue-100 text-gray-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || undefined} alt="User" />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
        </div>
      )
    }

    return <p>No conversation content available</p>
  }

  let content

  if (status === "loading" || isLoading || isSubscriptionLoading) {
    content = (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  } else if (status === "authenticated") {
    content = (
      <DashboardShell>
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="gap-1 pl-0 text-gray-500 hover:text-gray-900"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <Button variant="ghost" className="text-gray-500 hover:text-red-600 gap-1" onClick={handleDeleteClick}>
            <Trash2 className="h-4 w-4" />
            Delete Conversation
          </Button>
        </div>

        {isEditingTitle ? (
          <div className="flex items-center gap-2 mb-6">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-xl font-semibold"
              placeholder="Enter conversation title"
              autoFocus
            />
            <Button variant="outline" onClick={saveEditedTitle} className="text-green-600">
              Save
            </Button>
            <Button variant="ghost" onClick={cancelEditingTitle} className="text-gray-500">
              Cancel
            </Button>
          </div>
        ) : (
          <DashboardHeader
            heading={
              <div className="flex items-center gap-2">
                <span>{conversation?.title || "Conversation"}</span>
                {isPaidUser && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-blue-600"
                    onClick={startEditingTitle}
                    title="Edit Title"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            }
            text={`Created on ${conversation ? new Date(conversation.createdAt).toLocaleDateString() : ""}`}
          />
        )}

        <div className="grid gap-6">
          {/* Conversation Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Conversation</CardTitle>
            </CardHeader>
            <CardContent>{renderMessages()}</CardContent>
          </Card>
          {/* Generated Note */}
          {note.length > 0 &&
            note
              .filter((n) => n.conversationId === conversation?.id) // Add this filter to match the conversationId
              .map((n) => (
                <Card key={n.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl">Generated Note</CardTitle>
                    {session?.user?.id && n.id && (
                      <ShareNoteDialog
                        noteId={n.id}
                        noteTitle={n.conversation?.title || "Untitled Note"}
                        onShareSuccess={fetchData}
                      />
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Summary of Main Ideas:</h3>
                      <div className="bg-blue-50 p-4 rounded-md">
                        <p className="whitespace-pre-wrap text-gray-700">{n.content}</p>
                      </div>
                    </div>

                    {n.actionItems && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Action Items:</h3>
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="whitespace-pre-wrap text-gray-700">{n.actionItems}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

          {/* Audio player if available */}
          {conversation?.audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Audio Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <audio controls className="w-full">
                  <source src={conversation.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          )}
        </div>

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
