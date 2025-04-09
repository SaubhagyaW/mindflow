import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, transcript, messages } = await req.json()

    if (!title || !transcript || !messages) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Received save request:", {
      userId: session.user.id,
      title,
      transcriptLength: transcript.length,
      messagesCount: messages.length,
    })

    // Save the conversation
    try {
      console.log("Creating conversation in database with userId:", session.user.id)

      const conversation = await prisma.conversation.create({
        data: {
          title,
          transcript,
          userId: session.user.id,
          audioUrl: null, // Set to null since we're not storing audio files yet
        },
      })

      console.log("Conversation saved successfully:", conversation.id)

      // Generate summary and action items using OpenAI
      const summaryResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/openai/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
        cache: "no-store", // Next.js 15 explicit no caching
      })

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json()
        console.error("Summary generation failed:", errorData)
        throw new Error("Failed to generate summary")
      }

      const summaryData = await summaryResponse.json()
      console.log("Summary generated successfully")

      // Create note with summary and action items
      const note = await prisma.note.create({
        data: {
          content: summaryData.summary,
          actionItems: summaryData.actionItems,
          userId: session.user.id,
          conversationId: conversation.id,
        },
      })

      console.log("Note created:", note.id)

      return NextResponse.json(
        {
          conversation,
          note,
        },
        { status: 201 },
      )
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Database operation failed",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error saving conversation:", error)
    return NextResponse.json(
      {
        error: "Failed to save conversation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

