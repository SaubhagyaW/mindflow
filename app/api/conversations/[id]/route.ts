import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { decrypt } from "@/lib/encryption"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { notes: true },
    })

    if (!conversation) {
      console.log("Conversation not found:", params.id)
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    let decryptedTitle = ""
    let decryptedTranscript = ""
    let decryptedMessages = null
    const decryptedNotes = []

    try {
      decryptedTitle = decrypt(conversation.title)
    } catch (e) {
      console.error("Error decrypting title:", conversation.title, e)
    }

    try {
      decryptedTranscript = decrypt(conversation.transcript)
    } catch (e) {
      console.error("Error decrypting transcript:", conversation.transcript, e)
    }

    try {
      if (conversation.messages) {
        const decryptedRaw = decrypt(conversation.messages as unknown as string)
        decryptedMessages = JSON.parse(decryptedRaw)
      }
    } catch (e) {
      console.error("Error decrypting messages:", conversation.messages, e)
    }

    for (const note of conversation.notes) {
      try {
        decryptedNotes.push({
          ...note,
          content: decrypt(note.content),
          actionItems: note.actionItems ? decrypt(note.actionItems) : null,
        })
      } catch (e) {
        console.error(`Error decrypting note content or actionItems:`, note, e)
        decryptedNotes.push({
          ...note,
          content: "Decryption failed",
          actionItems: null,
        })
      }
    }

    const decryptedConversation = {
      ...conversation,
      title: decryptedTitle,
      transcript: decryptedTranscript,
      messages: decryptedMessages,
      notes: decryptedNotes,
    }

    return NextResponse.json(decryptedConversation)
  } catch (error) {
    console.error("Unexpected error fetching conversation:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Optional: Add user permission check here

    await prisma.conversation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Conversation deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
