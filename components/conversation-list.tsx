"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, MessageSquare, FileText, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { ShareNoteDialog } from "@/components/share-note-dialog"

type Conversation = {
  id: string
  title: string
  preview: string
  date: Date
  hasNotes: boolean
}

export function ConversationList() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Product Brainstorming",
      preview: "Discussion about new features for the mobile app...",
      date: new Date(2025, 3, 1),
      hasNotes: true,
    },
    {
      id: "2",
      title: "Marketing Strategy",
      preview: "Ideas for the upcoming social media campaign...",
      date: new Date(2025, 2, 28),
      hasNotes: true,
    },
    {
      id: "3",
      title: "Team Retrospective",
      preview: "Discussing what went well and what could be improved...",
      date: new Date(2025, 2, 25),
      hasNotes: false,
    },
  ])

  // In a real app, we would fetch conversations from the API
  useEffect(() => {
    if (session?.user?.id) {
      const fetchConversations = async () => {
        try {
          console.log("Fetching conversations for user:", session.user.id)
          const response = await fetch(`/api/conversations?userId=${session.user.id}`, {
            cache: "no-store", // Next.js 15 explicit no caching
          })

          if (response.ok) {
            const data = await response.json()
            console.log("Fetched conversations:", data)

            // Transform data to match our Conversation type
            const formattedConversations = data.map((conv: any) => ({
              id: conv.id,
              title: conv.title,
              preview: conv.transcript.substring(0, 100) + "...",
              date: new Date(conv.createdAt),
              hasNotes: true, // Assuming all conversations have notes
            }))

            setConversations(formattedConversations)
          } else {
            console.error("Failed to fetch conversations:", await response.json())
          }
        } catch (error) {
          console.error("Error fetching conversations:", error)
        }
      }

      // Actually fetch the data (uncomment this line)
      fetchConversations()
    }
  }, [session])

  const handleDelete = async (id: string) => {
    try {
      // In a real app, we would call the API to delete the conversation
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
        cache: "no-store", // Next.js 15 explicit no caching
      })

      if (response.ok) {
        setConversations(conversations.filter((conv) => conv.id !== id))
        toast({
          title: "Conversation deleted",
          description: "The conversation has been removed from your history.",
        })
      } else {
        throw new Error("Failed to delete conversation")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewNotes = (id: string) => {
    toast({
      title: "Notes opened",
      description: "Opening notes for this conversation.",
    })
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-500 mb-6">Start a new conversation to see it here.</p>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            // Try to find and click the "new" tab in the dashboard
            const newTabTrigger = document.querySelector('[data-state="inactive"][value="new"]') as HTMLElement
            if (newTabTrigger) {
              newTabTrigger.click()
            } else {
              // Fallback to services page if not in dashboard
              window.location.href = "/services"
            }
          }}
        >
          Start Conversation
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Card key={conversation.id} className="bg-white hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{conversation.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => (window.location.href = `/dashboard/conversations/${conversation.id}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Conversation
                  </DropdownMenuItem>
                  {conversation.hasNotes && (
                    <DropdownMenuItem onClick={() => handleViewNotes(conversation.id)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Notes
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => handleDelete(conversation.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-gray-500 mb-4">{formatDistanceToNow(conversation.date, { addSuffix: true })}</p>
            <p className="text-gray-700 line-clamp-3">{conversation.preview}</p>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>Conversation</span>
                {conversation.hasNotes && (
                  <>
                    <span className="mx-2">•</span>
                    <FileText className="h-3 w-3 mr-1" />
                    <span>Notes available</span>
                  </>
                )}
              </div>
              {conversation.hasNotes && <ShareNoteDialog noteId={conversation.id} noteTitle={conversation.title} />}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
