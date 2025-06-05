import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    console.log("=== RESEND VERIFICATION EMAIL REQUEST ===")

    // Get session and request body
    const session = await getServerSession(authOptions)
    console.log("Session user:", session?.user?.email)

    let requestBody
    try {
      requestBody = await req.json()
    } catch (e) {
      console.error("Failed to parse request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { email } = requestBody
    console.log("Request email:", email)

    // Determine which email to use
    const targetEmail = email || session?.user?.email

    if (!targetEmail) {
      console.error("No email provided and no session email found")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Target email for verification:", targetEmail)

    // Find the user in database
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: {
        id: true,
        email: true,
        isVerified: true,
        verificationToken: true,
        name: true
      }
    })

    if (!user) {
      console.error("User not found in database for email:", targetEmail)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Found user:", { id: user.id, email: user.email, isVerified: user.isVerified })

    // Check if user is already verified
    if (user.isVerified) {
      console.log("User already verified, no need to resend")
      return NextResponse.json({
        message: "Email already verified",
        isVerified: true
      })
    }

    // Generate a new verification token
    const verificationToken = randomBytes(32).toString("hex")
    console.log("Generated new verification token:", verificationToken.substring(0, 8) + "...")

    // Update the user with the new token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
      select: { id: true, email: true, verificationToken: true }
    })

    console.log("Updated user with new token:", updatedUser.id)

    // Send the verification email
    try {
      console.log("Attempting to send verification email...")
      const emailResult = await sendVerificationEmail(targetEmail, verificationToken)
      console.log("Verification email sent successfully:", emailResult)

      return NextResponse.json({
        message: "Verification email sent successfully",
        email: targetEmail,
        success: true
      })

    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)

      // Provide more specific error information
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError)

      return NextResponse.json({
        error: "Failed to send verification email",
        details: errorMessage,
        email: targetEmail
      }, { status: 500 })
    }

  } catch (error) {
    console.error("=== RESEND VERIFICATION ERROR ===")
    console.error("Error details:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json({
      error: "Internal server error",
      details: errorMessage
    }, { status: 500 })
  }
}
