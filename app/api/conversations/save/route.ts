import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

async function generateSummary(transcript: string) {
  if (!transcript || transcript.trim().length < 10) {
    return {
      summary: "No meaningful conversation transcript was provided to generate a summary.",
      actionItems: "",
    }
  }

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/openai/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to generate summary: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return {
      summary: data.summary || "No summary available",
      actionItems: data.actionItems || "",
    }
  } catch (error) {
    console.error("Summary generation error:", error)
    return {
      summary: "Summary generation failed. Please check the conversation transcript.",
      actionItems: "",
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      title = "Voice Conversation",
      transcript = "No transcript available",
      messages = [{ role: "user", content: "Voice conversation" }],
    } = body

    const conversation = await prisma.conversation.create({
      data: {
        title,
        transcript,
        userId: session.user.id,
        audioUrl: null,
        messages,
      },
    })

    const summaryData = await generateSummary(transcript)

    const note = await prisma.note.create({
      data: {
        content: summaryData.summary,
        actionItems: summaryData.actionItems,
        userId: session.user.id,
        conversationId: conversation.id,
      },
    })

    return NextResponse.json({ conversation, note }, { status: 201 })
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
