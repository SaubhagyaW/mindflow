import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Updating terms acceptance for user:", session.user.id)

    // Update user to mark terms as accepted
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        hasAcceptedTerms: true,
      },
    })

    console.log("Terms acceptance updated:", updatedUser.hasAcceptedTerms)

    return NextResponse.json({
      message: "Terms accepted successfully",
      user: {
        id: updatedUser.id,
        hasAcceptedTerms: updatedUser.hasAcceptedTerms,
      },
    })
  } catch (error) {
    console.error("Terms acceptance error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

