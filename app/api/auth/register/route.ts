import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import prisma from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export const dynamic = "force-dynamic" // Ensure this route is not cached

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    console.log("Registration attempt for email:", email)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex")
    console.log("Generated verification token:", verificationToken)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        hashedPassword: hashedPassword, // For compatibility
        isVerified: false,
        verificationToken,
        hasAcceptedTerms: false,
        subscription: {
          create: {
            plan: "free",
          },
        },
      },
    })

    console.log("User created successfully:", user.id)

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(email, verificationToken)
      console.log("Verification email sent successfully:", emailResult)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)

      // Don't fail registration if email fails, but log it
      console.warn("Registration completed but email verification failed:", emailError)
    }

    // Return user without sensitive data
    const { password: _, verificationToken: __, hashedPassword: ___, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "User registered successfully. Please check your email to verify your account.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong during registration" }, { status: 500 })
  }
}
