import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")
    console.log("Received verification request with token:", token)

    if (!token) {
      console.error("Verification failed: No token provided")
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    })

    if (!user) {
      console.log("Checking if user is already verified...")

      // Check if token might be expired but user is already verified
      const verifiedUser = await prisma.user.findFirst({
        where: {
          isVerified: true,
          verificationToken: null,
        },
      })

      if (verifiedUser) {
        console.log("User is already verified")
        return NextResponse.json({ message: "Email already verified" })
      }

      console.error("Verification failed: Invalid token")
      return NextResponse.json({ error: "Invalid verification token" }, { status: 400 })
    }

    console.log("User found, updating verification status for user:", user.id)

    // Update user to mark as verified and remove the token
    // Also set hasAcceptedTerms to true since email verification implies acceptance
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
        hasAcceptedTerms: true, // Set this to true as well for consistency
        verificationToken: null,
      },
    })

    console.log("Email verification successful for user:", user.id)
    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
