import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        notes: true,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to delete (in a real app)
    // This would verify the user's subscription plan

    await prisma.conversation.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Conversation deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

