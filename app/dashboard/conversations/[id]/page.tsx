"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, MessageSquare, FileText, Trash2 } from "lucide-react"
import { ShareNoteDialog } from "@/components/share-note-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"

type Conversation = {
  id: string
  title: string
  transcript: string
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
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [activeTab, setActiveTab] = useState("conversation")

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id && id) {
      fetchConversationData()
    }
  }, [session, id])

  const fetchConversationData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setConversation(data)
        if (data.notes && data.notes.length > 0) {
          setNote(data.notes[0])
        }
      } else {
        console.error("Failed to fetch conversation:", await response.json())
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching conversation:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
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
    }
  }

  // Function to format the conversation transcript
  const formatTranscript = (transcript: string) => {
    // Split the transcript into sections
    const sections = transcript.split(/(\d+\.\s+\*\*.*?\*\*)/g).filter(Boolean)

    return (
      <div className="space-y-6">
        {sections.map((section, index) => {
          // Check if this is a section header
          if (section.match(/^\d+\.\s+\*\*.*?\*\*/)) {
            const title = section.replace(/^\d+\.\s+\*\*|\*\*$/g, "")
            return (
              <div key={index} className="mt-8 mb-4">
                <h3 className="text-xl font-bold text-blue-700">{title}</h3>
              </div>
            )
          } else {
            // Process the content of each section
            const lines = section.split("\n").filter(Boolean)
            return (
              <div key={index} className="space-y-4">
                {lines.map((line, lineIndex) => {
                  // Check if line starts with "You:" or "AI:"
                  if (line.startsWith("You:") || line.startsWith("AI:")) {
                    const [speaker, ...content] = line.split(":")
                    const speakerClass = speaker === "You" ? "text-blue-600" : "text-green-600"

                    return (
                      <div
                        key={lineIndex}
                        className="flex items-start p-3 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        <div className={`font-bold ${speakerClass} w-16 flex-shrink-0`}>{speaker}:</div>
                        <div className="text-gray-700">{content.join(":")}</div>
                      </div>
                    )
                  }

                  // Check if line starts with a dash (bullet point)
                  if (line.trim().startsWith("- ")) {
                    return (
                      <div key={lineIndex} className="flex items-start ml-6">
                        <span className="text-blue-600 mr-2 font-bold">•</span>
                        <span className="text-gray-700">{line.trim().substring(2)}</span>
                      </div>
                    )
                  }

                  // Regular paragraph
                  return (
                    <p key={lineIndex} className="text-gray-700">
                      {line}
                    </p>
                  )
                })}
              </div>
            )
          }
        })}
      </div>
    )
  }

  // Function to format notes content
  const formatNotes = (content: string) => {
    if (!content) return <p className="text-gray-500 italic">No content available</p>

    // Split content into sections
    const sections = content.split(/(\*\*.*?\*\*)/g).filter(Boolean)

    return (
      <div className="space-y-3">
        {sections.map((section, index) => {
          // Check if section is a header (with ** **)
          if (section.startsWith("**") && section.endsWith("**")) {
            return (
              <h4 key={index} className="font-bold text-lg text-blue-700 mt-5 mb-3">
                {section.replace(/\*\*/g, "")}
              </h4>
            )
          }

          // Process regular content with bullet points
          const lines = section.split("\n").filter(Boolean)
          return (
            <div key={index} className="space-y-2">
              {lines.map((line, lineIndex) => {
                // Check if line is a bullet point
                if (line.trim().startsWith("- ")) {
                  return (
                    <div key={lineIndex} className="flex items-start ml-2">
                      <span className="text-blue-600 mr-2 font-bold">•</span>
                      <span className="text-gray-700">{line.trim().substring(2)}</span>
                    </div>
                  )
                }

                // Regular line
                return (
                  <p key={lineIndex} className="text-gray-700">
                    {line}
                  </p>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  // Function to format action items
  const formatActionItems = (actionItems: string) => {
    if (!actionItems) return null

    const lines = actionItems.split("\n").filter(Boolean)

    return (
      <div className="space-y-3">
        {lines.map((line, index) => {
          // Check if line is a bullet point
          if (line.trim().startsWith("- ")) {
            return (
              <div key={index} className="flex items-start">
                <span className="text-green-600 mr-2 font-bold">✓</span>
                <span className="text-gray-700">{line.trim().substring(2)}</span>
              </div>
            )
          }

          // Regular line
          return (
            <p key={index} className="text-gray-700">
              {line}
            </p>
          )
        })}
      </div>
    )
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Conversation Not Found"
          text="The conversation you're looking for doesn't exist or you don't have permission to view it."
        >
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </DashboardHeader>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={conversation.title}
        text={`Created on ${new Date(conversation.createdAt).toLocaleDateString()}`}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          {note && (
            <ShareNoteDialog
              noteId={note.id}
              noteTitle={conversation.title}
              onShareSuccess={() => fetchConversationData()}
            />
          )}
        </div>
      </DashboardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger
            value="conversation"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversation
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            disabled={!note}
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="space-y-4">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl font-bold text-gray-900">Conversation Transcript</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {conversation.transcript && formatTranscript(conversation.transcript)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {note ? (
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-900">Generated Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">Summary of Main Ideas:</h3>
                    <div className="bg-blue-50 p-5 rounded-md border border-blue-100">
                      {note.content && formatNotes(note.content)}
                    </div>
                  </div>

                  {note.actionItems && (
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-3">Action Items:</h3>
                      <div className="bg-green-50 p-5 rounded-md border border-green-100">
                        {formatActionItems(note.actionItems)}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <ShareNoteDialog
                      noteId={note.id}
                      noteTitle={conversation.title}
                      onShareSuccess={() => fetchConversationData()}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes available</h3>
              <p className="text-gray-500">This conversation doesn't have any generated notes.</p>
            </div>
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
}
