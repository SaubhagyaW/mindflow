import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import prisma from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex")

    console.log("Creating user with verification settings:", {
      email,
      isVerified: false,
      hasVerificationToken: !!verificationToken
    })

    // Create user with explicit verification settings
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false, // Explicitly set to false
        hasAcceptedTerms: false, // Also ensure terms are not accepted yet
        verificationToken,
        subscription: {
          create: {
            plan: "free",
          },
        },
      },
    })

    console.log("User created with verification status:", {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
      hasAcceptedTerms: user.hasAcceptedTerms
    })

    // Try to send verification email, but don't fail registration if it fails
    try {
      await sendVerificationEmail(email, verificationToken)
      console.log("Verification email sent successfully to:", email)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Continue with registration process despite email failure
    }

    // Return user without password and verification token
    const { password: _, verificationToken: __, ...userWithoutSensitiveData } = user

    return NextResponse.json(
      {
        user: userWithoutSensitiveData,
        message: "User registered successfully. Please check your email to verify your account.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
