import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/db"
import { getPlanTimeLimit } from "@/lib/subscription"
import { Prisma } from "@prisma/client"

// Import auth options from wherever they are defined in your project
// If they're in app/api/auth/[...nextauth]/route.ts, you might need to create a separate auth.ts file
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Define a type for the subscription data returned from raw queries
type SubscriptionData = {
  monthlyTimeLimit: number | null
  usedTime: number | null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If no subscription, return free plan details
    if (!user.subscription) {
      return NextResponse.json({
        plan: "free",
        timeLimit: 3600, // 1 hour in seconds
        usedTime: 0,
        remainingTime: 3600,
        isActive: true,
        expiresAt: null,
      })
    }

    const subscription = user.subscription
    const now = new Date()
    const isActive = !subscription.endDate || subscription.endDate > now

    // Get subscription data using raw SQL to avoid TypeScript errors
    const result = await prisma.$queryRaw<SubscriptionData[]>(
      Prisma.sql`SELECT "monthlyTimeLimit", "usedTime" FROM "Subscription" WHERE "id" = ${subscription.id}`,
    )

    // Extract values from the result
    const subscriptionData = result[0] || { monthlyTimeLimit: null, usedTime: null }
    const timeLimit = subscriptionData.monthlyTimeLimit ?? getPlanTimeLimit(subscription.plan)
    const usedTime = subscriptionData.usedTime ?? 0
    const remainingTime = timeLimit === -1 ? -1 : Math.max(0, timeLimit - usedTime)

    return NextResponse.json({
      plan: subscription.plan,
      timeLimit,
      usedTime,
      remainingTime,
      isActive,
      expiresAt: subscription.endDate ? subscription.endDate.toISOString() : null,
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
