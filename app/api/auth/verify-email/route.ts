import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")
    console.log("Email verification attempt with token:", token?.substring(0, 8) + "...")

    if (!token) {
      console.error("No verification token provided")
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    })

    if (!user) {
      console.log("No user found with verification token")

      // Check if user might already be verified
      const allUsers = await prisma.user.findMany({
        where: { isVerified: true },
        select: { id: true, email: true }
      })
      console.log("Verified users count:", allUsers.length)

      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    if (user.isVerified) {
      console.log("User already verified:", user.email)
        return NextResponse.json({ message: "Email already verified" })
      }

    console.log("Verifying user:", user.email)

    // Update user to mark as verified and remove the token
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    })

    console.log("User verification successful:", updatedUser.email, "isVerified:", updatedUser.isVerified)

    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified
      }
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({
      error: "Something went wrong during verification",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
