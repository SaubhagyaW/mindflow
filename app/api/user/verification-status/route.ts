import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get the actual verification status from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true,
                isVerified: true,
                verificationToken: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const dbIsVerified = Boolean(user.isVerified)
        const sessionIsVerified = Boolean(session.user.isVerified)

        console.log("Verification status check:", {
            email: user.email,
            dbIsVerified,
            sessionIsVerified,
            hasToken: !!user.verificationToken,
            mismatch: dbIsVerified !== sessionIsVerified
        })

        return NextResponse.json({
            isVerified: dbIsVerified,
            hasVerificationToken: !!user.verificationToken,
            sessionMatch: dbIsVerified === sessionIsVerified,
            sessionIsVerified,
            dbIsVerified
        })

    } catch (error) {
        console.error("Error checking verification status:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
