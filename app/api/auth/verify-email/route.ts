import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")
    console.log("Received verification request with token:", token)

    if (!token) {
      console.error("Verification failed: No token provided")
      return NextResponse.redirect(new URL('/verify-email?error=invalid_token', req.url))
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    })

    if (!user) {
      console.log("No user found with token, checking if user is already verified...")

      // Check if token might be expired but user is already verified
      const verifiedUser = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          isVerified: true,
        },
      })

      if (verifiedUser) {
        console.log("User is already verified")
        // Clear the token since verification is complete
        await prisma.user.update({
          where: { id: verifiedUser.id },
          data: { verificationToken: null },
        })
        return NextResponse.redirect(new URL('/dashboard?verified=already', req.url))
      }

      console.error("Verification failed: Invalid or expired token")
      return NextResponse.redirect(new URL('/verify-email?error=invalid_token', req.url))
    }

    console.log("User found, updating verification status for user:", user.id)

    // Update user to mark as verified and clear the verification token
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    })

    console.log("Email verification successful for user:", {
      id: user.id,
      email: user.email,
      isVerified: updatedUser.isVerified,
      verificationTokenCleared: updatedUser.verificationToken === null
    })

    // Redirect to success page with a flag to refresh the session
    return NextResponse.redirect(new URL('/dashboard?verified=success&refresh=true', req.url))

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL('/verify-email?error=server_error', req.url))
  }
}
