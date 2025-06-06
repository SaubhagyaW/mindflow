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
        isVerified: false, // Only update if not already verified
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
        // Redirect to a success page with a message
        return NextResponse.redirect(new URL('/dashboard?verified=already', req.url))
      }

      console.error("Verification failed: Invalid or expired token")
      // Redirect to an error page
      return NextResponse.redirect(new URL('/verify-email?error=invalid_token', req.url))
    }

    console.log("User found, updating verification status for user:", user.id)

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

    console.log("Email verification successful for user:", user.id)

    // Redirect to success page
    return NextResponse.redirect(new URL('/dashboard?verified=success', req.url))

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL('/verify-email?error=server_error', req.url))
  }
}
