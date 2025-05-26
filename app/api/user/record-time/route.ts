import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { recordConversationTime } from "@/lib/subscription"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, seconds } = body

    // Verify the user is recording their own time
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate seconds
    if (typeof seconds !== "number" || seconds <= 0) {
      return NextResponse.json({ error: "Invalid time value" }, { status: 400 })
    }

    // Record the conversation time
    await recordConversationTime(userId, seconds)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording conversation time:", error)
    return NextResponse.json({ error: "Failed to record conversation time" }, { status: 500 })
  }
}
