import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { encrypt } from "@/lib/encryption"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversationId = params.id
    const { title } = await req.json()

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isPaidUser = user.subscription && user.subscription.plan !== "free"

    if (!isPaidUser) {
      return NextResponse.json({ error: "Title editing is available for premium users only" }, { status: 403 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (conversation.userId !== user.id) {
      return NextResponse.json({ error: "You don't have permission to edit this conversation" }, { status: 403 })
    }

    const encryptedTitle = encrypt(title.trim())

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: encryptedTitle },
    })

    return NextResponse.json(updatedConversation)
  } catch (error) {
    console.error("Error updating conversation title:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}