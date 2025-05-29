/**
 * Subscription utility functions for managing conversation time limits
 */

import prisma from "@/lib/db"
import { Prisma } from "@prisma/client"

// Define a type for the subscription data returned from raw queries
type SubscriptionData = {
  monthlyTimeLimit: number | null
  usedTime: number | null
}

/**
 * Get the monthly time limit in seconds for a subscription plan
 */
export function getPlanTimeLimit(plan: string): number {
  // PROD
  // switch (plan) {
  //   case "free":
  //     return 60 * 30 // 30 mins
  //   case "pro-2h":
  //     return 60 * 60 * 2 // 2 hours
  //   case "pro-5h":
  //     return 60 * 60 * 5 // 5 hours
  //   case "pro-10h":
  //     return 60 * 60 * 10 // 10 hours
  //   default:
  //     return 60 * 30 // Default to 30 mins (Free plan)
  // }

  // DEV
  switch (plan) {
    case "free":
      return 60 * 5 // 5 mins
    case "pro-2h":
      return 60 * 10 // 10 mins
    case "pro-5h":
      return 60 * 15 // 15 mins
    case "pro-10h":
      return 60 * 20 // 20 mins
    default:
      return 60 * 5 // Default to 5 mins (Free plan)
  }
}

/**
 * Check if a user has enough conversation time remaining
 * @param userId User ID
 * @param requestedSeconds Seconds requested for the conversation
 * @returns Object with isAllowed flag and remaining time
 */
export async function checkConversationTimeLimit(
  userId: string,
  requestedSeconds = 0,
): Promise<{ isAllowed: boolean; remainingSeconds: number; plan: string; message: string }> {
  try {
    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    // If no subscription, use free plan limits
    if (!user?.subscription) {
      const freeLimit = getPlanTimeLimit("free")
      const message = `You don't have an active subscription. Free plan limit: ${formatTime(freeLimit)}.`
      return {
        isAllowed: requestedSeconds <= freeLimit,
        remainingSeconds: freeLimit,
        plan: "free",
        message,
      }
    }

    const subscription = user.subscription

    // Check if subscription is expired
    if (subscription.endDate && subscription.endDate < new Date()) {
      const freeLimit = getPlanTimeLimit("free")
      const message = `Your subscription has expired. Free plan limit: ${formatTime(freeLimit)}.`
      return {
        isAllowed: requestedSeconds <= freeLimit,
        remainingSeconds: freeLimit,
        plan: "free",
        message,
      }
    }

    // Get the monthly time limit using raw SQL to avoid TypeScript errors
    const result = await prisma.$queryRaw<SubscriptionData[]>(
      Prisma.sql`SELECT "monthlyTimeLimit", "usedTime" FROM "Subscription" WHERE "id" = ${subscription.id}`,
    )

    // Extract values from the result
    const subscriptionData = result[0] || { monthlyTimeLimit: null, usedTime: null }
    const monthlyTimeLimit = subscriptionData.monthlyTimeLimit ?? getPlanTimeLimit(subscription.plan)
    const usedTime = subscriptionData.usedTime ?? 0

    // If unlimited plan, always allow
    if (monthlyTimeLimit === -1) {
      return {
        isAllowed: true,
        remainingSeconds: -1,
        plan: subscription.plan,
        message: "You have unlimited conversation time.",
      }
    }

    // Calculate remaining time
    const remainingSeconds = Math.max(0, monthlyTimeLimit - usedTime)

    // Check if enough time is available
    const isAllowed = requestedSeconds <= remainingSeconds

    const message = isAllowed
      ? `You have ${formatTime(remainingSeconds)} remaining this month.`
      : `Not enough time remaining. You have ${formatTime(remainingSeconds)} left, but need ${formatTime(requestedSeconds)}.`

    return {
      isAllowed,
      remainingSeconds,
      plan: subscription.plan,
      message,
    }
  } catch (error) {
    console.error("Error checking conversation time limit:", error)
    // Default to allowing with a warning
    return {
      isAllowed: true,
      remainingSeconds: 0,
      plan: "unknown",
      message: "Could not verify subscription status. Proceeding with caution.",
    }
  }
}

/**
 * Record used conversation time for a user
 * @param userId User ID
 * @param seconds Seconds used in the conversation
 */
export async function recordConversationTime(userId: string, seconds: number): Promise<void> {
  try {
    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (!user?.subscription) {
      console.log(`User ${userId} has no subscription, not recording time`)
      return
    }

    // Get subscription data using raw SQL
    const result = await prisma.$queryRaw<SubscriptionData[]>(
      Prisma.sql`SELECT "monthlyTimeLimit", "usedTime" FROM "Subscription" WHERE "id" = ${user.subscription.id}`,
    )

    // Extract values from the result
    const subscriptionData = result[0] || { monthlyTimeLimit: null, usedTime: null }
    const monthlyTimeLimit = subscriptionData.monthlyTimeLimit ?? getPlanTimeLimit(user.subscription.plan)
    const currentUsedTime = subscriptionData.usedTime ?? 0

    // Skip for unlimited plans
    if (monthlyTimeLimit === -1) {
      return
    }

    // Update used time using raw SQL
    const newUsedTime = currentUsedTime + seconds
    await prisma.$executeRaw(
      Prisma.sql`UPDATE "Subscription" SET "usedTime" = ${newUsedTime}, "updatedAt" = NOW() WHERE "id" = ${user.subscription.id}`,
    )

    console.log(`Recorded ${seconds} seconds for user ${userId}. Total used: ${newUsedTime}`)
  } catch (error) {
    console.error("Error recording conversation time:", error)
  }
}

/**
 * Reset monthly used time for all users
 * This should be run on a monthly schedule
 */
export async function resetMonthlyUsedTime(): Promise<void> {
  try {
    await prisma.$executeRaw(Prisma.sql`UPDATE "Subscription" SET "usedTime" = 0, "updatedAt" = NOW()`)
    console.log("Reset monthly used time for all subscriptions")
  } catch (error) {
    console.error("Error resetting monthly used time:", error)
  }
}

/**
 * Format seconds into a human-readable time string
 */
export function formatTime(seconds: number): string {
  if (seconds === -1) {
    return "unlimited time"
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
