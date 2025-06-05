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

        console.log("Verification status check:", {
            email: user.email,
            dbIsVerified: user.isVerified,
            sessionIsVerified: session.user.isVerified,
            hasToken: !!user.verificationToken
        })

        return NextResponse.json({
            isVerified: user.isVerified,
            hasVerificationToken: !!user.verificationToken,
            sessionMatch: user.isVerified === session.user.isVerified
        })

    } catch (error) {
        console.error("Error checking verification status:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
