import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { encrypt, decrypt } from "@/lib/encryption"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const decrypted = conversations.map((conv) => ({
      ...conv,
      title: decrypt(conv.title),
      transcript: decrypt(conv.transcript),
      messages: conv.messages ? JSON.parse(decrypt(conv.messages as unknown as string)) : null,
    }))

    return NextResponse.json(decrypted)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, transcript, audioUrl, userId } = await req.json()

    // Encrypt data
    const encryptedTitle = encrypt(title)
    const encryptedTranscript = encrypt(transcript)

    const conversation = await prisma.conversation.create({
      data: {
        title: encryptedTitle,
        transcript: encryptedTranscript,
        audioUrl,
        userId,
      },
    })

    // Generate notes (still unencrypted at this point)
    const summary = generateSummary(transcript)
    const actionItems = extractActionItems(transcript)

    // Encrypt notes
    const encryptedSummary = encrypt(summary)
    const encryptedActions = encrypt(actionItems)

    await prisma.note.create({
      data: {
        content: encryptedSummary,
        actionItems: encryptedActions,
        userId,
        conversationId: conversation.id,
      },
    })

    return NextResponse.json({
      ...conversation,
      title,
      transcript,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// Helper functions for note generation
function generateSummary(transcript: string): string {
  const sentences = transcript.split(/[.!?]+/).filter(Boolean)
  const summary = sentences.slice(0, 3).join(". ")
  return summary + "."
}

function extractActionItems(transcript: string): string {
  const lower = transcript.toLowerCase()
  if (lower.includes("action") || lower.includes("task") || lower.includes("todo")) {
    return "- Follow up on discussion points\n- Schedule next meeting"
  }
  return ""
}
