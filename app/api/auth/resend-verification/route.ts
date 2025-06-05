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

    const session = await getServerSession(authOptions)
    console.log("Session user:", session?.user?.email)
    console.log("Session isVerified:", session?.user?.isVerified)

    let requestBody
    try {
      requestBody = await req.json()
    } catch (e) {
      console.error("Failed to parse request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { email } = requestBody
    const targetEmail = email || session?.user?.email

    if (!targetEmail) {
      console.error("No email provided")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Target email for verification:", targetEmail)

    // IMPORTANT: Query the database directly to get the real verification status
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

    // Log the ACTUAL database state vs session state
    console.log("=== VERIFICATION STATUS COMPARISON ===")
    console.log("Database isVerified:", user.isVerified)
    console.log("Session isVerified:", session?.user?.isVerified)
    console.log("Current verification token exists:", !!user.verificationToken)

    // Check the ACTUAL database verification status (not session)
    if (user.isVerified) {
      console.log("User is actually verified in database - updating session")

      // The user is verified in DB but session is out of sync
      // Return success and let the frontend handle session update
      return NextResponse.json({
        message: "Email already verified",
        isVerified: true,
        shouldUpdateSession: true // Flag to update session
      })
    }

    console.log("User is not verified in database, proceeding with resend...")

    // Generate a new verification token
    const verificationToken = randomBytes(32).toString("hex")
    console.log("Generated new verification token:", verificationToken.substring(0, 8) + "...")

    // Update the user with the new token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
      select: { id: true, email: true, verificationToken: true }
    })

    console.log("Updated user with new token")

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
