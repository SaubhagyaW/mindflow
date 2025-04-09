import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, transcript, audioUrl, userId } = await req.json()

    const conversation = await prisma.conversation.create({
      data: {
        title,
        transcript,
        audioUrl,
        userId,
      },
    })

    // Generate notes automatically
    await prisma.note.create({
      data: {
        content: `Summary of "${title}":\n\n${generateSummary(transcript)}`,
        actionItems: extractActionItems(transcript),
        userId,
        conversationId: conversation.id,
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// Helper functions for note generation
function generateSummary(transcript: string): string {
  // In a real app, this would use OpenAI API for summarization
  // This is a placeholder implementation
  const sentences = transcript.split(/[.!?]+/).filter(Boolean)
  const summary = sentences.slice(0, 3).join(". ")
  return summary + "."
}

function extractActionItems(transcript: string): string {
  // In a real app, this would use OpenAI API to extract action items
  // This is a placeholder implementation
  if (
    transcript.toLowerCase().includes("action") ||
    transcript.toLowerCase().includes("task") ||
    transcript.toLowerCase().includes("todo")
  ) {
    return "- Follow up on discussion points\n- Schedule next meeting"
  }
  return ""
}

