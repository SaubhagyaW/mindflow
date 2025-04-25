import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { sendNoteShareEmail, simulateWhatsAppShare } from "@/lib/email"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user's email is verified
    if (!session.user.isVerified) {
      return NextResponse.json({ error: "Email verification required to share notes" }, { status: 403 })
    }

    const { method, recipient } = await req.json()

    if (!method || !recipient) {
      return NextResponse.json({ error: "Method and recipient are required" }, { status: 400 })
    }

    // Find the note
    const note = await prisma.note.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            subscription: true,
          },
        },
        conversation: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Check if user has permission to share (paid plan)
    if (note.user.subscription?.plan === "free") {
      regitturn NextResponse.json({ error: "Sharing is only available for paid plans" }, { status: 403 })
    }

    // Update note to mark as shared
    await prisma.note.update({
      where: {
        id: params.id,
      },
      data: {
        isShared: true,
      },
    })

    // Share the note based on the method
    let shareResponse
    const noteTitle = note.conversation.title || "Untitled Note"

    if (method === "email") {
      // Share via email
      shareResponse = await sendNoteShareEmail(
        recipient,
        note.content + (note.actionItems ? `\n\nAction Items:\n${note.actionItems}` : ""),
        noteTitle,
      )
    } else if (method === "whatsapp") {
      // Share via WhatsApp (simulated for demo)
      shareResponse = await simulateWhatsAppShare(
        recipient,
        note.content + (note.actionItems ? `\n\nAction Items:\n${note.actionItems}` : ""),
        noteTitle,
      )
    } else {
      return NextResponse.json({ error: "Invalid sharing method" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      method,
      noteId: params.id,
      recipient,
      message: `Note shared via ${method}`,
      details: shareResponse,
    })
  } catch (error) {
    console.error("Error sharing note:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
