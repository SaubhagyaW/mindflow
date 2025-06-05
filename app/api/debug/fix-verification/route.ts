import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/db"

export const dynamic = "force-dynamic"

// This is a debug endpoint - remove in production
export async function POST() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        console.log("=== DEBUG: CHECKING USER VERIFICATION ===")

        // Check current database state
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true,
                isVerified: true,
                verificationToken: true,
                hasAcceptedTerms: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        console.log("Current user state in DB:", user)
        console.log("Current session state:", {
            email: session.user.email,
            isVerified: session.user.isVerified,
            hasAcceptedTerms: session.user.hasAcceptedTerms
        })

        // Check if there's a mismatch
        const mismatch = user.isVerified !== session.user.isVerified

        if (mismatch) {
            console.log("⚠️  MISMATCH DETECTED between database and session")
        }

        return NextResponse.json({
            user: {
                email: user.email,
                dbIsVerified: user.isVerified,
                sessionIsVerified: session.user.isVerified,
                mismatch: mismatch,
                hasVerificationToken: !!user.verificationToken
            },
            recommendations: mismatch ? [
                "Update session to match database",
                "Check why session is out of sync"
            ] : [
                "Database and session are in sync"
            ]
        })

    } catch (error) {
        console.error("Debug verification error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
