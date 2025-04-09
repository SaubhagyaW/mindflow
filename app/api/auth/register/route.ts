import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcrypt"
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

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        subscription: {
          create: {
            plan: "free",
          },
        },
      },
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    // Return user without password
    const { password: _, verificationToken: __, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "User registered successfully. Please check your email to verify your account.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

