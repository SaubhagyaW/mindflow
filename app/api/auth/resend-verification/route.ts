import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function POST(req: NextRequest) {
  try {
    // Get the current session to verify the user is logged in
    const session = await getServerSession(authOptions)

    // Get email from request body or session
    const { email } = await req.json()

    // Verify the email matches the session user's email or the user is an admin
    if (!session?.user?.email && !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = email || session?.user?.email

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user is already verified, no need to resend
    if (user.isVerified) {
      return NextResponse.json({ message: "Email already verified" })
    }

    // Generate a new verification token
    const verificationToken = randomBytes(32).toString("hex")

    // Update the user with the new token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationToken,
      },
    })

    // Send the verification email
    try {
      await sendVerificationEmail(userEmail, verificationToken)
      return NextResponse.json({ message: "Verification email sent successfully" })
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      return NextResponse.json(
        {
          error: "Failed to send verification email",
          details: emailError instanceof Error ? emailError.message : String(emailError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
