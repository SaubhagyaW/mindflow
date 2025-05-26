import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { encrypt } from "@/lib/encryption"

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

    // Encrypt fields before saving
    const encryptedTitle = encrypt(title)
    const encryptedTranscript = encrypt(transcript)
    const encryptedMessages = encrypt(JSON.stringify(messages))

    const conversation = await prisma.conversation.create({
      data: {
        title: encryptedTitle,
        transcript: encryptedTranscript,
        userId: session.user.id,
        audioUrl: null,
        messages: encryptedMessages,
      },
    })

    const summaryData = await generateSummary(transcript)

    const encryptedSummary = encrypt(summaryData.summary)
    const encryptedActionItems = encrypt(summaryData.actionItems)

    const note = await prisma.note.create({
      data: {
        content: encryptedSummary,
        actionItems: encryptedActionItems,
        userId: session.user.id,
        conversationId: conversation.id,
      },
    })

    // Return plain versions to client (optional, or return just `id`)
    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title,
        transcript,
        messages,
      },
      note: {
        id: note.id,
        content: summaryData.summary,
        actionItems: summaryData.actionItems,
      },
    }, { status: 201 })
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
