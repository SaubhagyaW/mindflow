import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { encrypt, decrypt } from "@/lib/encryption"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const conversationId = searchParams.get("conversationId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const whereClause: any = { userId }
    if (conversationId) {
      whereClause.conversationId = conversationId
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        conversation: {
          select: {
            title: true,
          },
        },
      },
    })

    // Decrypt content, actionItems, AND conversation title
    const decryptedNotes = notes.map(note => ({
      ...note,
      content: decrypt(note.content),
      actionItems: decrypt(note.actionItems ?? ""),
      conversation: note.conversation ? {
        ...note.conversation,
        title: decrypt(note.conversation.title)
      } : null
    }))

    return NextResponse.json(decryptedNotes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, actionItems, userId, conversationId, isShared } = await req.json()

    const encryptedContent = encrypt(content)
    const encryptedActionItems = encrypt(actionItems)

    const note = await prisma.note.create({
      data: {
        content: encryptedContent,
        actionItems: encryptedActionItems,
        isShared: isShared || false,
        userId,
        conversationId,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}