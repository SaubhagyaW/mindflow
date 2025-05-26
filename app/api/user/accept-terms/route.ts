import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

export async function POST() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if the user is authenticated
    if (!session?.user?.id) {
      console.error("User not authenticated")
      return NextResponse.json({ error: "You must be signed in to accept terms" }, { status: 401 })
    }

    const userId = session.user.id

    console.log(`Updating terms acceptance for user ${userId}`)

    // Update the user's hasAcceptedTerms field in the database
    // Removed termsAcceptedAt field since it doesn't exist in the schema
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasAcceptedTerms: true,
      },
    })

    console.log(`Terms acceptance updated successfully for user ${userId}`)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Terms accepted successfully",
      user: {
        id: updatedUser.id,
        hasAcceptedTerms: updatedUser.hasAcceptedTerms,
      },
    })
  } catch (error) {
    console.error("Error accepting terms:", error)
    return NextResponse.json({ error: "Failed to accept terms. Please try again." }, { status: 500 })
  }
}
