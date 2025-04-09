import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

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

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, actionItems, userId, conversationId, isShared } = await req.json()

    const note = await prisma.note.create({
      data: {
        content,
        actionItems,
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

