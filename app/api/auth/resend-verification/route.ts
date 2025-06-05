import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { email } = await req.json()

    console.log("Resend verification request for:", email || session?.user?.email)

    const userEmail = email || session?.user?.email

    if (!userEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.log("User not found for email:", userEmail)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user is already verified
    if (user.isVerified) {
      console.log("User already verified:", userEmail)
      return NextResponse.json({ message: "Email already verified" })
    }

    // Generate a new verification token
    const verificationToken = randomBytes(32).toString("hex")
    console.log("Generated new verification token for:", userEmail)

    // Update the user with the new token
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    })

    // Send the verification email
    try {
      await sendVerificationEmail(userEmail, verificationToken)
      console.log("Verification email resent successfully to:", userEmail)
      return NextResponse.json({ message: "Verification email sent successfully" })
    } catch (emailError) {
      console.error("Failed to resend verification email:", emailError)
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
